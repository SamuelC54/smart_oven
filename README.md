# smart_oven


# Raspberry Pi Deployment Setup (Tailscale + GitHub Actions)

This document explains the **one-time setup** needed so GitHub Actions can deploy updates automatically to your Raspberry Pi over Tailscale.

---

## 1. Prepare the Raspberry Pi

### Install Node.js, npm, and Git
```bash
sudo apt update
sudo apt install -y nodejs npm git openssh-server
node -v
npm -v
```

### Enable ssh and start it:
```bash
sudo systemctl enable --now ssh
sudo systemctl status ssh
```

You should see: Active: ``active (running)``


### Create the project directory
```bash
mkdir -p ~/smart-oven
cd ~/smart-oven
git init  # empty repo so rsync has a place to copy files
```

---

## 2. Install and configure Tailscale

1. **Install Tailscale:**
   ```bash
   curl -fsSL https://tailscale.com/install.sh | sh
   sudo tailscale up
   ```
   - Follow the URL shown to authenticate.
   - Use the same Tailscale account for both Pi and your development machine.

2. **Find the Pi's Tailscale IP:**
   ```bash
   tailscale ip -4
   ```
   - It will look like `100.x.x.x`.
   - Save this for later — this will be the `PI_HOST` GitHub secret.

3. **Find the Pi's Username:**
   ```bash
   whoami
   ```

---

## 3. Create an SSH key for GitHub Actions

On your **development machine**: (use bash if on window)

```bash
ssh-keygen -t ed25519 -f ~/.ssh/oven_deploy -C "ci to pi"
```
- Press **Enter** for no passphrase.
- Two files are created:
  - Private key: `~/.ssh/oven_deploy`
  - Public key: `~/.ssh/oven_deploy.pub`

---

## 4. Add the SSH public key to the Pi

```bash
ssh <PI_USERNAME>@<PI_TAILSCALE_IP> "mkdir -p ~/.ssh && chmod 700 ~/.ssh"
cat ~/.ssh/oven_deploy.pub | ssh <PI_USERNAME>@<PI_TAILSCALE_IP> "cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
```

Test the connection:
```bash
ssh -i ~/.ssh/oven_deploy <PI_USERNAME>@<PI_TAILSCALE_IP>
```
You should log in without a password.

---

## 5. Configure GitHub Secrets

In your GitHub repository:
1. Go to **Settings → Secrets and variables → Actions**.
2. Add the following secrets:
   - **`PI_SSH_KEY`** → contents of `~/.ssh/oven_deploy` (private key file)
   - **`PI_HOST`** → Pi’s Tailscale IP (e.g., `100.64.12.34`)
   - **`PI_USER`** → `pi`
   - **`PI_DIR`** → `/home/pi/smart-oven`

---

## 6. Create the backend systemd service on the Pi

```ini
# /etc/systemd/system/oven-backend.service
[Unit]
Description=Oven Backend (Node/Fastify)
After=network.target

[Service]
User=pi
Environment=NODE_ENV=production PORT=8000 HEATER_PIN=17
WorkingDirectory=/home/pi/oven/backend
ExecStart=/usr/bin/node /home/pi/oven/backend/server.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now oven-backend
```

---

## 7. Done! Deploy via GitHub Actions

Once the GitHub Actions workflow is in place:
- `git push` to the `main` branch
- Actions will:
  1. Build the frontend
  2. Install backend dependencies
  3. Rsync files to the Pi over Tailscale
  4. Restart the backend service

Check deployment logs in **GitHub → Actions**.
