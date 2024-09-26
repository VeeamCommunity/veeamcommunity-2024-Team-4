terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = ">= 4.3"
    }
    random = {
      source  = "hashicorp/random"
      version = ">= 3.6.2"
    }
  }
  required_version = ">=1.8.5"
}

provider "azurerm" {
  features {}
  subscription_id = var.subscription_id
}