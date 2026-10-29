from typing import List, Dict, Any

VEHICLE_CATEGORIES = [
    {
        "code": "sedan_taxi",
        "name": "Sedan / Hatchback Taxi",
        "description": "Passenger car for tourist / taxi operations (e.g. Maruti Dzire Tour, Hyundai Aura, Tata Tigor)",
        "applicable_documents": ["RC", "INSURANCE", "PUC", "FITNESS", "PERMIT", "ROAD_TAX"],
        "default_use": "passenger_commercial"
    },
    {
        "code": "suv_commercial",
        "name": "Commercial SUV / MUV",
        "description": "6 to 8 seater tourist cab (e.g. Toyota Innova Crysta, Maruti Ertiga, Kia Carens)",
        "applicable_documents": ["RC", "INSURANCE", "PUC", "FITNESS", "PERMIT", "ROAD_TAX"],
        "default_use": "passenger_commercial"
    },
    {
        "code": "tempo_traveller",
        "name": "Tempo Traveller / Maxi Cab",
        "description": "9 to 26 seater passenger vehicle for tours, staff transit, and charters (e.g. Force Traveller, Cruiser)",
        "applicable_documents": ["RC", "INSURANCE", "PUC", "FITNESS", "PERMIT", "ROAD_TAX", "SPEED_GOVERNOR"],
        "default_use": "passenger_commercial"
    },
    {
        "code": "bus",
        "name": "Bus / Luxury Coach",
        "description": "Commercial passenger bus for contract carriage or intercity tourism (e.g. Volvo, BharatBenz, Ashok Leyland)",
        "applicable_documents": ["RC", "INSURANCE", "PUC", "FITNESS", "PERMIT", "ROAD_TAX", "SPEED_GOVERNOR"],
        "default_use": "passenger_commercial"
    },
    {
        "code": "mini_truck",
        "name": "Mini Truck / LCV",
        "description": "Light commercial vehicle under 7.5T (e.g. Tata Ace Gold, Mahindra Bolero Maxi, Ashok Leyland Dost)",
        "applicable_documents": ["RC", "INSURANCE", "PUC", "FITNESS", "PERMIT", "ROAD_TAX"],
        "default_use": "goods_carrier"
    },
    {
        "code": "goods_truck",
        "name": "Medium / Heavy Goods Truck",
        "description": "Rigid lorry or 6-to-10 wheeler for regional or national freight transit (e.g. Tata Signa, Eicher Pro, BharatBenz)",
        "applicable_documents": ["RC", "INSURANCE", "PUC", "FITNESS", "PERMIT", "ROAD_TAX", "SPEED_GOVERNOR"],
        "default_use": "goods_carrier"
    },
    {
        "code": "multi_axle_trailer",
        "name": "Multi-Axle Trailer / Heavy Haulage",
        "description": "14 to 22 wheeler articulated vehicle for heavy machinery and long-haul shipping",
        "applicable_documents": ["RC", "INSURANCE", "PUC", "FITNESS", "PERMIT", "ROAD_TAX", "SPEED_GOVERNOR"],
        "default_use": "goods_carrier"
    },
    {
        "code": "tanker",
        "name": "Liquid / Bulk Tanker",
        "description": "Petroleum, chemical, milk, or bulk water tanker carriage",
        "applicable_documents": ["RC", "INSURANCE", "PUC", "FITNESS", "PERMIT", "ROAD_TAX", "SPEED_GOVERNOR", "GREEN_TAX"],
        "default_use": "goods_carrier"
    },
    {
        "code": "tipper",
        "name": "Tipper / Dumper Truck",
        "description": "Heavy commercial tipper for mining, sand, aggregate, and construction transit",
        "applicable_documents": ["RC", "INSURANCE", "PUC", "FITNESS", "PERMIT", "ROAD_TAX", "SPEED_GOVERNOR"],
        "default_use": "goods_carrier"
    },
    {
        "code": "container",
        "name": "Container Freight Carrier",
        "description": "Closed-body container truck for secure parcel and FMCG freight transit",
        "applicable_documents": ["RC", "INSURANCE", "PUC", "FITNESS", "PERMIT", "ROAD_TAX", "SPEED_GOVERNOR"],
        "default_use": "goods_carrier"
    }
]

DOCUMENT_CATEGORIES: Dict[str, Dict[str, Any]] = {
    "RC": {
        "code": "RC",
        "name": "Registration Certificate (RC)",
        "description": "Official RTO vehicle registration certificate",
        "applies_to": "vehicle",
        "is_mandatory": True,
        "default_warning_days": 60,
        "authority_hint": "Regional Transport Office (RTO)"
    },
    "INSURANCE": {
        "code": "INSURANCE",
        "name": "Motor Insurance Policy",
        "description": "Commercial Comprehensive or Third-Party Liability Insurance",
        "applies_to": "vehicle",
        "is_mandatory": True,
        "default_warning_days": 30,
        "authority_hint": "Insurance Company (e.g. ICICI Lombard, New India, Tata AIG)"
    },
    "PUC": {
        "code": "PUC",
        "name": "Pollution Under Control (PUC)",
        "description": "Emissions compliance certificate from certified testing center",
        "applies_to": "vehicle",
        "is_mandatory": True,
        "default_warning_days": 15,
        "authority_hint": "Authorized Emission Testing Station"
    },
    "FITNESS": {
        "code": "FITNESS",
        "name": "Vehicle Fitness Certificate",
        "description": "Form 38 roadworthiness certificate for commercial transport",
        "applies_to": "vehicle",
        "is_mandatory": True,
        "default_warning_days": 30,
        "authority_hint": "State Transport Department / Motor Vehicle Inspector"
    },
    "PERMIT": {
        "code": "PERMIT",
        "name": "Commercial Transport Permit",
        "description": "All India Tourist Permit (AITP), State Permit, or National Goods Permit",
        "applies_to": "vehicle",
        "is_mandatory": True,
        "default_warning_days": 30,
        "authority_hint": "State Transport Authority / STA"
    },
    "ROAD_TAX": {
        "code": "ROAD_TAX",
        "name": "Road Tax / MV Tax Token",
        "description": "Motor Vehicle Tax payment token / receipt",
        "applies_to": "vehicle",
        "is_mandatory": True,
        "default_warning_days": 15,
        "authority_hint": "State RTO / Vahan Portal"
    },
    "SPEED_GOVERNOR": {
        "code": "SPEED_GOVERNOR",
        "name": "Speed Governor Certificate",
        "description": "Speed Limiting Device (SLD) fitness and calibration certificate",
        "applies_to": "vehicle",
        "is_mandatory": False,
        "default_warning_days": 30,
        "authority_hint": "ARAI / Certified SLD Fitment Vendor"
    },
    "GREEN_TAX": {
        "code": "GREEN_TAX",
        "name": "Green Tax / Environmental Cess",
        "description": "Pollution / aged commercial vehicle green tax receipt",
        "applies_to": "vehicle",
        "is_mandatory": False,
        "default_warning_days": 30,
        "authority_hint": "State Transport Department"
    },
    "DRIVING_LICENCE": {
        "code": "DRIVING_LICENCE",
        "name": "Commercial Driving Licence",
        "description": "Valid Transport / Commercial Driving Licence (LMV-TR, HMV, TRANS)",
        "applies_to": "driver",
        "is_mandatory": True,
        "default_warning_days": 30,
        "authority_hint": "Licensing Authority / RTO"
    },
    "BADGE": {
        "code": "BADGE",
        "name": "Public Service Vehicle (PSV) Badge",
        "description": "Authorization badge for passenger commercial transport drivers",
        "applies_to": "driver",
        "is_mandatory": False,
        "default_warning_days": 30,
        "authority_hint": "RTO / Police Verification Cell"
    },
    "MEDICAL_CERT": {
        "code": "MEDICAL_CERT",
        "name": "Driver Medical Fitness Certificate",
        "description": "Form 1-A medical fitness declaration for commercial drivers",
        "applies_to": "driver",
        "is_mandatory": False,
        "default_warning_days": 30,
        "authority_hint": "Registered Medical Practitioner"
    }
}

INDIAN_STATES = [
    {"code": "MH", "name": "Maharashtra"},
    {"code": "KA", "name": "Karnataka"},
    {"code": "DL", "name": "Delhi"},
    {"code": "TN", "name": "Tamil Nadu"},
    {"code": "GJ", "name": "Gujarat"},
    {"code": "RJ", "name": "Rajasthan"},
    {"code": "UP", "name": "Uttar Pradesh"},
    {"code": "HR", "name": "Haryana"},
    {"code": "PB", "name": "Punjab"},
    {"code": "WB", "name": "West Bengal"},
    {"code": "AP", "name": "Andhra Pradesh"},
    {"code": "TS", "name": "Telangana"},
    {"code": "KL", "name": "Kerala"},
    {"code": "MP", "name": "Madhya Pradesh"},
    {"code": "GA", "name": "Goa"},
    {"code": "UK", "name": "Uttarakhand"},
    {"code": "HP", "name": "Himachal Pradesh"},
]

def normalize_registration_number(reg_no: str) -> str:
    """Normalize registration number by removing spaces, hyphens, and converting to uppercase."""
    if not reg_no:
        return ""
    return "".join(c for c in reg_no.upper() if c.isalnum())
