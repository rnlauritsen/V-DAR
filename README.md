# V-DAR: Voron LIDAR System

V-DAR is a sub-pixel accurate LIDAR calibration system for Klipper-based 3D printers (optimized for Voron 2.4). It uses a standard line laser and UVC endoscope to automate flowrate and pressure advance calibration.

## Features
- **Ladder Scans:** Calibrate entire flow ranges in a single pass.
- **Sub-pixel Engine:** Compensates for low-resolution optics and slight misalignments.
- **Offline First:** All processing happens locally on your printer's controller.
- **V-DAR Studio:** A polished web interface for managing calibrations and profiles.

## Installation

### 1. Requirements (Prerequisites)
If you get a `command not found` error for `npm`, run these commands first to install Node.js:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Clone the Repository
Once you have exported this project from AI Studio to your own GitHub, run:

```bash
git clone https://github.com/YOUR_USERNAME/V-DAR.git
cd V-DAR
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run the Interface
```bash
npm run dev
```

The interface will be available at `http://localhost:3000`.

### Klipper Configuration
To "enable" the hardware, add this to your `printer.cfg`:

1. **Laser Definition:**
   ```ini
   [output_pin vdar_laser]
   pin: !PC1  # Replace with your actual FAN port pin
   pwm: true
   value: 0
   shutdown_value: 0
   ```

2. **Scan Macro:**
   ```ini
   [gcode_macro V_DAR_SCAN]
   gcode:
       SET_PIN PIN=vdar_laser VALUE=1
       M117 Scanning...
       # Your scan routine here
       SET_PIN PIN=vdar_laser VALUE=0
   ```

## Installation Success
Your V-DAR service is now running. You can access the interface at:
`http://[your-printer-ip]:3000`

### Adding to Klipper UI
- **Mainsail:** Settings -> Interface -> Scroll to bottom -> External Links -> Add `V-DAR` @ `http://[ip]:3000`.
- **Fluidd:** Settings -> External Links -> Add link to `http://[ip]:3000`.

## Updating V-DAR
To update your installation after making changes in the AI Studio editor:

1. Push your changes from AI Studio to GitHub.
2. SSH into your printer and run:
   ```bash
   cd ~/V-DAR
   git pull
   npm install
   sudo systemctl restart vdar
   ```

## Auto-Start on Boot (Daemon)
To ensure V-DAR starts automatically on your printer controller:

1. Create a service file:
   ```bash
   sudo nano /etc/systemd/system/vdar.service
   # In nano: Paste content, then press Ctrl+O, Enter to save, and Ctrl+X to exit.
   ```
2. Paste the following (Ensure the `[Unit]` and `[Service]` tags are included exactly as shown):
   ```ini
   [Unit]
   Description=V-DAR LIDAR Studio
   After=network.target

   [Service]
   Type=simple
   User=admin
   WorkingDirectory=/home/admin/V-DAR
   ExecStart=/usr/bin/npm run dev
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```
3. Enable and start:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable vdar
   sudo systemctl start vdar
   ```

## Macro-First Workflow (Highly Recommended)
Because KlipperScreen, OctoEverywhere, and embedded browser frames have strict security limits, V-DAR is best operated via **Klipper Macros**. This allows you to trigger scans directly from your printer's physical screen.

### 1. Download the Macros
Download [vdar_macros.txt](./vdar_macros.txt) and copy the contents into your `printer.cfg`.

### 2. Available Macros
Once added, these will appear in your **Macros** menu:
- `V_DAR_PLA`: Optimized for standard filament.
- `V_DAR_ABS`: Optimized for high-temperature material.
- `V_DAR_PETG`: Optimized for specific adhesion parameters.

### 3. Usage
Simply click the button for the material you are using. The results will be logged to the console, and you can still view the graphical data at:
`http://[your-printer-ip]:3000`

---

## Service Installation
To ensure V-DAR starts on boot:
1. SSH into your printer.
2. Follow the steps in the **Klipper Macros** tab in the web interface to create the `vdar.service` file.

### Direct Access
If you cannot find the integration settings, or it's not working, verify the service is reachable:
1. Open a new browser tab and go to `http://[your-printer-ip]:3000`.
2. If it doesn't load, check if the app is bound to the correct network interface:
   - Run `netstat -tulpn | grep :3000` in SSH.
   - It should show `0.0.0.0:3000` (listening on all IPs).
   - If it shows `127.0.0.1:3000`, it's only accessible from the printer itself. Ensure you haven't restricted the host in `package.json` or `vite.config.ts`.
3. Check firewall: `sudo ufw allow 3000/tcp` (if using UFW).

## Troubleshooting
If `http://[your-ip]:3000` does not load, or you see "Assignment outside of section":

1. **Check Headers:** Ensure your service file starts with `[Unit]` on the very first line. No characters or spaces should come before it.
2. **Find your path:** Run `pwd` to see your actual directory (e.g., `/home/admin/V-DAR`).
3. **Fix Service:** `sudo nano /etc/systemd/system/vdar.service`.
4. **Update:** Ensure `User=admin` and `WorkingDirectory=/home/admin/V-DAR` match.
5. **Reload & Restart:** 
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl restart vdar
   sudo systemctl status vdar
   ```
6. **Logs:** If it still fails, check logs: `journalctl -u vdar -n 50 --no-pager`.

## Hardware Setup
1. Mount your 5mW line laser and endoscope to the toolhead.
2. Connect the laser to a controllable fan port (e.g., `FAN1`).
3. Identify your camera ID using `ls /dev/v4l/by-id/`.
4. Configure the offsets in the V-DAR Studio settings tab.

## Credits
Based on the V-DAR open-source initiative. Developed as a standalone Klipper integration.
