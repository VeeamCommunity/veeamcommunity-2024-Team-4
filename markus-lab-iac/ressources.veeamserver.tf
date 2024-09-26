resource "azurerm_network_interface" "veeamserver" {
  name                = "${var.veeamserver_name}-nic"
  location            = azurerm_resource_group.lab.location
  resource_group_name = azurerm_resource_group.lab.name

  ip_configuration {
    name                          = "internal"
    subnet_id                     = azurerm_subnet.lab[0].id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.veeamserver.id
  }

  tags = var.tags
}

resource "random_id" "pip" {
  byte_length = 4
}

resource "azurerm_public_ip" "veeamserver" {
  name                = "${var.veeamserver_name}-pip"
  resource_group_name = azurerm_resource_group.lab.name
  location            = azurerm_resource_group.lab.location
  allocation_method   = "Static"
  sku                 = "Standard"
  domain_name_label   = "pip-${random_id.pip.hex}"

  tags = var.tags
}

resource "azurerm_windows_virtual_machine" "veeamserver" {
  name                = var.veeamserver_name
  resource_group_name = azurerm_resource_group.lab.name
  location            = azurerm_resource_group.lab.location
  size                = "Standard_D2_v3"
  admin_username      = var.admin_username
  admin_password      = var.admin_password
  network_interface_ids = [
    azurerm_network_interface.veeamserver.id
  ]

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }

  source_image_reference {
    publisher = "MicrosoftWindowsServer"
    offer     = "WindowsServer"
    sku       = "2022-Datacenter"
    version   = "latest"
  }

  tags = var.tags
}