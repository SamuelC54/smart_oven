# Smart Oven

# Raspberry Pi Deployment Setup (With Github runner)

This document explains the **one-time setup** needed so GitHub Actions can deploy updates automatically to your Raspberry Pi a github runner.

---

## 1. Prepare the Raspberry Pi to become a runner

follow the step here: https://docs.github.com/en/actions/how-tos/manage-runners/self-hosted-runners/add-runners
for ARM architecture

the runner must have the label: self-hosted

## 7. Done! Deploy via GitHub Runner workflow

Once the GitHub Actions workflow is in place:

- `git push` to the `main` branch
