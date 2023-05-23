FROM gitpod/workspace-full

RUN sudo apt-get update &&
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y libatk-bridge2.0-0 &&
  sudo rm -rf /var/lib/apt/lists/*
