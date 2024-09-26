resource "azurerm_resource_group" "lab" {
  name     = var.rg-lab-name
  location = var.location

  tags = var.tags
}

resource "azurerm_virtual_network" "lab" {
  name                = var.vnet-lab-name
  location            = azurerm_resource_group.lab.location
  resource_group_name = azurerm_resource_group.lab.name
  address_space       = var.vnet-lab-addressspace

  tags = var.tags
}

resource "azurerm_subnet" "lab" {
  name                 = var.subnet-lab-names[count.index]
  virtual_network_name = azurerm_virtual_network.lab.name
  resource_group_name  = azurerm_resource_group.lab.name
  address_prefixes     = [var.subnet-lab-prefixes[count.index]]
  count                = length(var.subnet-lab-names)
}

resource "azurerm_network_security_group" "veeamserver" {
  name                = "${var.veeamserver_name}-nsg"
  location            = azurerm_resource_group.lab.location
  resource_group_name = azurerm_resource_group.lab.name

  security_rule {
    name                       = "RDP"
    priority                   = 1001
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "3389"
    source_address_prefix      = var.myip
    destination_address_prefix = "*"
  }

  tags = var.tags
}

resource "azurerm_subnet_network_security_group_association" "veeamserver" {
  subnet_id                 = azurerm_subnet.lab[0].id
  network_security_group_id = azurerm_network_security_group.veeamserver.id
}