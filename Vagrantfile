Vagrant::Config.run do |config|
  config.vm.box = "Debian Jessie 8.0 Release x64 (Minimal, Shrinked, Guest Additions 4.3.26)"
  
  config.vm.box_url = "https://github.com/holms/vagrant-jessie-box/releases/download/Jessie-v0.1/Debian-jessie-amd64-netboot.box"

  config.vm.forward_port 51893, 51893

  config.vm.share_folder "app", "/home/vagrant/app", "./"

  config.ssh.username = "vagrant"
  config.ssh.password = "vagrant"

  # Uncomment the following line to allow for symlinks
  # in the app folder. This will not work on Windows, and will
  # not work with Vagrant providers other than VirtualBox
  # config.vm.customize ["setextradata", :id, "VBoxInternal2/SharedFoldersEnableSymlinksCreate/app", "1"]

  config.vm.provision :chef_solo do |chef|
    chef.add_recipe "nodejs"
    chef.add_recipe "mongodb-debs"
  end

  config.vm.provision :shell, :inline => "sudo apt-get install -y git"
  config.vm.provision :shell, :inline => "sudo npm install jspm/jspm-cli -g"
  config.vm.provision :shell, :inline => "sudo apt-get install -y build-essential --no-install-recommends"
  config.vm.provision :shell, :inline => "sudo apt-get install -y redis-server --no-install-recommends"
  config.vm.provision :shell, :inline => "sudo apt-get install -y ruby --no-install-recommends"
end
