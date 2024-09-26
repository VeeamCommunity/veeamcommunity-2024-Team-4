resource "random_id" "sto" {
  byte_length = 4
}

resource "azurerm_storage_account" "veeam" {
  name                = "stoveeam${random_id.sto.hex}"
  resource_group_name = azurerm_resource_group.lab.name

  location                      = azurerm_resource_group.lab.location
  account_tier                  = "Standard"
  account_replication_type      = "LRS"
  public_network_access_enabled = false
  account_kind                  = "StorageV2"

  tags = var.tags
}

resource "azurerm_storage_container" "veeam" {
  name                  = "veeam"
  storage_account_name  = azurerm_storage_account.veeam.name
  container_access_type = "private"


}

resource "azurerm_private_endpoint" "veeam" {
  name                = "veeam-endpoint"
  location            = azurerm_resource_group.lab.location
  resource_group_name = azurerm_resource_group.lab.name
  subnet_id           = azurerm_subnet.lab[0].id

  private_service_connection {
    name                           = "veeam-privateserviceconnection"
    private_connection_resource_id = azurerm_storage_account.veeam.id
    subresource_names              = ["blob"]
    is_manual_connection           = false
  }

  private_dns_zone_group {
    name                 = "example-dns-zone-group"
    private_dns_zone_ids = [azurerm_private_dns_zone.blob.id]
  }
}

resource "azurerm_private_dns_zone" "blob" {
  name                = "privatelink.blob.core.windows.net"
  resource_group_name = azurerm_resource_group.lab.name
}

resource "azurerm_private_dns_zone_virtual_network_link" "veeam" {
  name                  = "veeam-link"
  resource_group_name   = azurerm_resource_group.lab.name
  private_dns_zone_name = azurerm_private_dns_zone.blob.name
  virtual_network_id    = azurerm_virtual_network.lab.id
}