# OUI Lookup Web Service

## Overview

The OUI Lookup Web Service is a RESTful API that allows users to search for Organizationally Unique Identifier (OUI) information using HTTP or HTTPS protocols. An OUI is a 24-bit number that uniquely identifies a vendor or manufacturer's network interface card (NIC).

## Features

- **OUI Information Retrieval:** Users can query the service to retrieve information about a specific OUI.
- **Company Name Lookup:** Users can search for OUI information by providing the name of a company.

## API Endpoints

### Retrieve OUI Information by OUI

#### Request

```http
GET /{OUI, MAC Address, or Company Name}
```

#### Response

```json
{
  "oui": "00:1A:2B",
  "company_name": "Example Corporation",
  "company_address": "1234 Main Street, City, Country",
  "company_website": "http://www.example.com"
}
```

## Getting Started

To use the OUI Lookup Web Service, follow these steps:
1. Access the Service: Make HTTP or HTTPS requests to the appropriate endpoint.
2. Retrieve OUI Information by OUI or Company Name: Use the provided endpoint to get information about a specific OUI.

## Example Usage

```bash
# Retrieve OUI Information by OUI
curl -X GET https://oui.pol4.dev/001A2B

# Retrieve OUI Information by Company Name
curl -X GET http://oui.pol4.dev/Example%20Corporation
```
