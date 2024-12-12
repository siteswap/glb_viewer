export class BikePower {
    constructor(powerValueId = 'powerValue', statusTextId = 'statusText') {
        this.CYCLING_POWER_SERVICE = 0x1818;
        this.CYCLING_POWER_MEASUREMENT = 0x2A63;
    }

    parsePower(value) {
        const data = new DataView(value.buffer);
        // Power is typically in the first 2 bytes (little endian)
        return data.getUint16(0, true);
    }

    async connectToTrainer() {
        try {
            const device = await navigator.bluetooth.requestDevice({
                filters: [{ services: [this.CYCLING_POWER_SERVICE] }]
            });

            if (this.statusTextElement) {
                this.statusTextElement.textContent = 'Connecting...';
            }
            
            const server = await device.gatt.connect();
            const service = await server.getPrimaryService(this.CYCLING_POWER_SERVICE);
            const characteristic = await service.getCharacteristic(this.CYCLING_POWER_MEASUREMENT);
            
            if (this.statusTextElement) {
                this.statusTextElement.textContent = 'Connected';
            }
            if (this.connectButton) {
                this.connectButton.disabled = true;
            }

            // Listen for power measurements
            await characteristic.startNotifications();
            characteristic.addEventListener('characteristicvaluechanged', (event) => {
                const power = this.parsePower(event.target.value);
                if (this.powerValueElement) {
                    this.powerValueElement.textContent = power;
                }
            });

        } catch (error) {
            console.error(error);
            if (this.statusTextElement) {
                this.statusTextElement.textContent = `Error: ${error.message}`;
            }
        }
    }
}
