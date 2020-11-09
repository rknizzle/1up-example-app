provider "aws" {
  region = "us-east-1"
}

# 1up client credentials
# You will be prompted to enter them when running terraform plan or apply
variable "CLIENT_ID" {
  type = string
}

variable "CLIENT_SECRET" {
  type = string
}

# pass the client credentials into the init bash script that will run on the server on startup
data "template_file" "init" {
  template = file("init.sh.tpl")

  vars = {
    CLIENT_ID = var.CLIENT_ID
    CLIENT_SECRET = var.CLIENT_SECRET
  }
}
