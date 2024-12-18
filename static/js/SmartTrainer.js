export class SmartTrainer {
    constructor(onPowerUpdate) {
        this.CYCLING_POWER_SERVICE = 0x1818;
        this.CYCLING_POWER_MEASUREMENT = 0x2A63;
        this.onPowerUpdate = onPowerUpdate;
        this.connectButton = document.getElementById('connectButton');
    }

    parsePower(value) {
        const data = new DataView(value.buffer);
        const instantaneousPower = data.getInt16(2, true); // Next 2 bytes are instantaneous power in watts (signed)
        return instantaneousPower;
    }

    async connect() {
        try {
            const device = await navigator.bluetooth.requestDevice({
                filters: [{ services: [this.CYCLING_POWER_SERVICE] }]
            });

            this.connectButton.textContent = 'Connecting...';

            const server = await device.gatt.connect();
            const service = await server.getPrimaryService(this.CYCLING_POWER_SERVICE);
            const characteristic = await service.getCharacteristic(this.CYCLING_POWER_MEASUREMENT);

            this.connectButton.disabled = true;
            this.connectButton.textContent = 'Connected';

            // Listen for power measurements
            await characteristic.startNotifications();
            characteristic.addEventListener('characteristicvaluechanged', (event) => {
                const power = this.parsePower(event.target.value);
                this.onPowerUpdate(power);
            });

        } catch (error) {
            console.error(error);
            this.connectButton.textContent = `Error: ${error.message}`;
        }
    }
}
