variable "subscription_id" {
  description = "Subscription for all resources"
  type        = string
}

variable "location" {
  description = "Location for all resources"
  type        = string
  default     = "germanywestcentral"
}

variable "tags" {
  description = "The tags to associate with your ressources"
  type        = map(string)
  default = {
    applicationname = "VeeamHackathon2024"
    environment     = "Dev"
  }
}

variable "rg-lab-name" {
  description = "Name of the Lab RG"
  type        = string
  default     = "rg-hack-lab-001"
}

variable "vnet-lab-name" {
  description = "Name of the Lab VNet"
  type        = string
  default     = "vnet-hack-lab-001"
}

variable "vnet-lab-addressspace" {
  description = "Address Space of the Lab VNet"
  type        = list(string)
  default     = ["10.10.0.0/16"]
}

variable "subnet-lab-prefixes" {
  description = "Subnet Prefixes of the Lab VNet"
  type        = list(string)
  default     = ["10.10.1.0/24", "10.10.2.0/24"]
}

variable "subnet-lab-names" {
  description = "Subnet Names of the Lab VNet"
  type        = list(string)
  default     = ["VeeamServer", "AzureBastionSubnet"]
}

variable "veeamserver_name" {
  description = "name of the Veeam Server"
  type        = string
  default     = "veeamserver"
}

variable "admin_username" {
  description = "admin username of the Veeam Server"
  type        = string
  default     = "veeamlab"
}

variable "admin_password" {
  description = "admin password of the Veeam Server"
  type        = string
  sensitive   = true
}

variable "myip" {
  description = "My Puplic IP for Remote Access"
  type        = string
}
