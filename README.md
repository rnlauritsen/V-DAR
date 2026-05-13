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

## Updating V-DAR
To update your installation after making changes in the AI Studio editor:

1. In AI Studio, click **Settings** (gear icon) -> **Export to GitHub**.
2. Select your repository and push the latest changes.
3. SSH into your printer controller and run:
   ```bash
   cd ~/V-DAR
   git pull
   npm install
   ```

## Auto-Start on Boot (Daemon)
To ensure V-DAR starts automatically on your printer controller:

1. Create a service file:
   ```bash
   sudo nano /etc/systemd/system/vdar.service
   ```
2. Paste the following (adjust `User` and `WorkingDirectory` if your username is not `pi`):
   ```ini
   [Unit]
   Description=V-DAR LIDAR Studio
   After=network.target

   [Service]
   Type=simple
   User=pi
   WorkingDirectory=/home/pi/V-DAR
   ExecStart=/usr/bin/npm run dev
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```
3. Enable and start:
   ```bash
   sudo systemctl enable vdar
   sudo systemctl start vdar
   ```

## Klipper UI Integration
To access V-DAR within your printer's web interface:

- **Mainsail:** Settings -> Interface -> External Links -> Add `http://[printer-ip]:3000` (Enable "Open in Frame").
- **Fluidd:** Settings -> External Links -> Add `http://[printer-ip]:3000`.

## Hardware Setup
1. Mount your 5mW line laser and endoscope to the toolhead.
2. Connect the laser to a controllable fan port (e.g., `FAN1`).
3. Identify your camera ID using `ls /dev/v4l/by-id/`.
4. Configure the offsets in the V-DAR Studio settings tab.

## Credits
Based on the V-DAR open-source initiative. Developed as a standalone Klipper integration.
