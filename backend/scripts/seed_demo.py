import os
import sys
import uuid
from datetime import date, timedelta, datetime, timezone

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.user import User
from app.models.workspace import Workspace, WorkspaceMembership
from app.models.vehicle import Vehicle
from app.models.driver import Driver, VehicleDriverAssignment
from app.models.document import VehicleDocument
from app.models.task import RenewalTask
from app.models.operations import FASTagRecord, MaintenanceRecord
from app.domain.rules import normalize_registration_number

def seed():
    db = SessionLocal()
    try:
        # Check if already seeded
        existing_user = db.query(User).filter(User.email == "demo@sparkradar.in").first()
        if existing_user:
            print("Demo data already seeded.")
            return

        print("Seeding Spark Radar with realistic Indian fleet compliance data...")

        # 1. Create Demo User
        user_id = str(uuid.uuid4())
        user = User(
            id=user_id,
            email="demo@sparkradar.in",
            hashed_password=get_password_hash("SparkRadar2026!"),
            full_name="Vikram Jadhav",
            phone="+91 98220 12345",
            is_active=True
        )
        db.add(user)

        # 2. Create Workspace: Sahyadri Tourist Transports (Travel Agency / Tourist Transport)
        ws_id = str(uuid.uuid4())
        workspace = Workspace(
            id=ws_id,
            name="Sahyadri Tourist Transports",
            slug="sahyadri-tourist-pune",
            business_type="travel_agency",
            state_jurisdiction="MH",
            contact_email="operations@sahyadritrans.in",
            contact_phone="+91 20 2553 9000",
            warning_threshold_days="30,15,7,1"
        )
        db.add(workspace)

        membership = WorkspaceMembership(
            id=str(uuid.uuid4()),
            workspace_id=ws_id,
            user_id=user_id,
            role="owner"
        )
        db.add(membership)

        # 3. Create Drivers
        driver1_id = str(uuid.uuid4())
        driver1 = Driver(
            id=driver1_id,
            workspace_id=ws_id,
            full_name="Santosh Shinde",
            phone="+91 98221 44556",
            email="santosh.driver@gmail.com",
            licence_number="MH12 20120034891",
            licence_category="LMV-TR",
            licence_expiry_date=date.today() + timedelta(days=420),
            badge_number="PSV-MH12-8821",
            status="active",
            notes="Experienced tourist coach and Tempo Traveller pilot with 12 years accident-free record."
        )
        db.add(driver1)

        driver2_id = str(uuid.uuid4())
        driver2 = Driver(
            id=driver2_id,
            workspace_id=ws_id,
            full_name="Dilip Patil",
            phone="+91 94220 77889",
            email=None,
            licence_number="MH14 20150098412",
            licence_category="HMV / TRANS",
            licence_expiry_date=date.today() + timedelta(days=12), # Expiring in 12 days!
            badge_number="PSV-MH14-3312",
            status="active",
            notes="Heavy passenger bus specialist. Licence renewal form Form-9 submitted at Pimpri RTO."
        )
        db.add(driver2)

        driver3_id = str(uuid.uuid4())
        driver3 = Driver(
            id=driver3_id,
            workspace_id=ws_id,
            full_name="Ramesh Jadhav",
            phone="+91 97660 33441",
            email=None,
            licence_number="MH12 20180056123",
            licence_category="LMV-TR",
            licence_expiry_date=date.today() + timedelta(days=650),
            badge_number="PSV-MH12-9011",
            status="active"
        )
        db.add(driver3)

        # 4. Vehicles
        # Vehicle 1: Force Tempo Traveller 3050 - ATTENTION (PUC due in 8 days)
        v1_id = str(uuid.uuid4())
        v1 = Vehicle(
            id=v1_id,
            workspace_id=ws_id,
            registration_number="MH 12 RN 4521",
            normalized_registration_number=normalize_registration_number("MH 12 RN 4521"),
            vehicle_category="tempo_traveller",
            vehicle_use="passenger_commercial",
            make="Force Motors",
            model="Traveller 3050 (17 Seater)",
            manufacturing_year=2023,
            fuel_type="Diesel",
            ownership_type="Owned",
            chassis_number="MC2B4ERD4PA092144",
            engine_number="FM26CR09412",
            notes="Regular group tour vehicle for Pune-Goa & Mahabaleshwar circuits."
        )
        db.add(v1)

        # Assign driver 1
        db.add(VehicleDriverAssignment(
            id=str(uuid.uuid4()),
            workspace_id=ws_id,
            vehicle_id=v1_id,
            driver_id=driver1_id,
            is_primary=True
        ))

        # Vehicle 1 Documents
        today = date.today()
        docs_v1 = [
            ("RC", "MH12RN4521/2023", "RTO Pune MH12", today - timedelta(days=365), today + timedelta(days=5000)),
            ("INSURANCE", "3001/4582910/00/000", "ICICI Lombard", today - timedelta(days=200), today + timedelta(days=165)),
            ("PUC", "MH12-PUC-2026-9812", "Shivaji Nagar PUC Station", today - timedelta(days=172), today + timedelta(days=8)), # Due in 8 days!
            ("FITNESS", "FORM38-MH12-2025-01", "Motor Vehicle Inspector, Pune RTO", today - timedelta(days=250), today + timedelta(days=115)),
            ("PERMIT", "AITP/MH/2023/88921", "State Transport Authority Maharashtra", today - timedelta(days=300), today + timedelta(days=65)),
            ("ROAD_TAX", "TAX-REC-2026-Q1", "Vahan Portal Maharashtra", today - timedelta(days=60), today + timedelta(days=30)),
            ("SPEED_GOVERNOR", "SLD-ARAI-99410", "Rosmerta Autotech SLD Center", today - timedelta(days=300), today + timedelta(days=65)),
        ]
        for cat, doc_num, auth, is_dt, exp_dt in docs_v1:
            db.add(VehicleDocument(
                id=str(uuid.uuid4()),
                workspace_id=ws_id,
                vehicle_id=v1_id,
                category_code=cat,
                document_number=doc_num,
                issuing_authority=auth,
                issue_date=is_dt,
                expiry_date=exp_dt,
                verification_status="verified"
            ))

        # FASTag for V1
        db.add(FASTagRecord(
            id=str(uuid.uuid4()),
            workspace_id=ws_id,
            vehicle_id=v1_id,
            tag_id="34161FA82032890014022",
            issuer_bank="ICICI Bank",
            recorded_status="active",
            notes="Affixed to windshield center top."
        ))

        # Maintenance for V1
        db.add(MaintenanceRecord(
            id=str(uuid.uuid4()),
            workspace_id=ws_id,
            vehicle_id=v1_id,
            service_date=today - timedelta(days=45),
            service_type="Scheduled 40,000 km Service",
            description="Engine oil replacement (Castrol 15W40), diesel filter, wheel alignment, AC filter cleanup.",
            odometer_km=42300,
            service_provider="Force Authorized Service - Tathawade",
            cost=8450.00
        ))

        # Vehicle 2: Toyota Innova Crysta Taxi - CRITICAL (Insurance expired 4 days ago)
        v2_id = str(uuid.uuid4())
        v2 = Vehicle(
            id=v2_id,
            workspace_id=ws_id,
            registration_number="MH 14 TC 8812",
            normalized_registration_number=normalize_registration_number("MH 14 TC 8812"),
            vehicle_category="taxi",
            vehicle_use="passenger_commercial",
            make="Toyota",
            model="Innova Crysta 2.4 VX (7 Seater)",
            manufacturing_year=2022,
            fuel_type="Diesel",
            ownership_type="Owned",
            chassis_number="MBJ11BB5608012948",
            engine_number="2GDFTV98214",
            notes="Corporate rental car for Hinjewadi IT park executive transfers."
        )
        db.add(v2)

        # Assign driver 3
        db.add(VehicleDriverAssignment(
            id=str(uuid.uuid4()),
            workspace_id=ws_id,
            vehicle_id=v2_id,
            driver_id=driver3_id,
            is_primary=True
        ))

        # Vehicle 2 Documents (Insurance EXPIRED!)
        docs_v2 = [
            ("RC", "MH14TC8812/2022", "Pimpri Chinchwad RTO", today - timedelta(days=730), today + timedelta(days=4500)),
            ("INSURANCE", "2024/0991823/00/000", "New India Assurance", today - timedelta(days=369), today - timedelta(days=4)), # EXPIRED 4 DAYS AGO!
            ("PUC", "MH14-PUC-2026-1120", "Akurdi Auto Emission Center", today - timedelta(days=50), today + timedelta(days=130)),
            ("FITNESS", "FORM38-MH14-2024-88", "PCMC RTO", today - timedelta(days=300), today + timedelta(days=65)),
            ("PERMIT", "PERMIT-MH-CAB-9901", "STA Maharashtra", today - timedelta(days=400), today + timedelta(days=330)),
            ("ROAD_TAX", "MV-TAX-PCMC-2025", "Vahan Maharashtra", today - timedelta(days=120), today + timedelta(days=245)),
        ]
        ins_doc_id = None
        for cat, doc_num, auth, is_dt, exp_dt in docs_v2:
            did = str(uuid.uuid4())
            if cat == "INSURANCE":
                ins_doc_id = did
            db.add(VehicleDocument(
                id=did,
                workspace_id=ws_id,
                vehicle_id=v2_id,
                category_code=cat,
                document_number=doc_num,
                issuing_authority=auth,
                issue_date=is_dt,
                expiry_date=exp_dt,
                verification_status="verified"
            ))

        # Task for Vehicle 2 Urgent Insurance Renewal
        db.add(RenewalTask(
            id=str(uuid.uuid4()),
            workspace_id=ws_id,
            vehicle_id=v2_id,
            document_id=ins_doc_id,
            title="URGENT: Renew Commercial Insurance for MH 14 TC 8812",
            description="Policy expired on New India Assurance. Quotation requested from Tata AIG and HDFC ERGO.",
            due_date=today,
            assigned_to_user_id=user_id,
            priority="urgent",
            status="in_progress"
        ))

        # FASTag for V2
        db.add(FASTagRecord(
            id=str(uuid.uuid4()),
            workspace_id=ws_id,
            vehicle_id=v2_id,
            tag_id="34161FA82099318820194",
            issuer_bank="State Bank of India (SBI)",
            recorded_status="active",
            notes="FASTag active and linked to Sahyadri corporate wallet."
        ))

        # Vehicle 3: Tata Winger - FULLY COMPLIANT
        v3_id = str(uuid.uuid4())
        v3 = Vehicle(
            id=v3_id,
            workspace_id=ws_id,
            registration_number="MH 12 BT 3349",
            normalized_registration_number=normalize_registration_number("MH 12 BT 3349"),
            vehicle_category="tempo_traveller",
            vehicle_use="passenger_commercial",
            make="Tata Motors",
            model="Winger Tourist Coach (12 Seater)",
            manufacturing_year=2024,
            fuel_type="Diesel",
            ownership_type="Owned",
            chassis_number="MAT482910PA99104",
            engine_number="2.2L_DICOR_9901",
            notes="New delivery luxury air-conditioned van for airport pick-ups."
        )
        db.add(v3)

        docs_v3 = [
            ("RC", "MH12BT3349/2024", "RTO Pune", today - timedelta(days=90), today + timedelta(days=5300)),
            ("INSURANCE", "AIG-COM-2024-9912", "Tata AIG General Insurance", today - timedelta(days=90), today + timedelta(days=275)),
            ("PUC", "PUC-PUN-2024-3310", "Camp RTO Station", today - timedelta(days=90), today + timedelta(days=275)),
            ("FITNESS", "FORM38-MH12-2024-3349", "Pune RTO", today - timedelta(days=90), today + timedelta(days=640)),
            ("PERMIT", "AITP-MH-2024-1188", "STA Maharashtra", today - timedelta(days=90), today + timedelta(days=275)),
            ("ROAD_TAX", "ROAD-TAX-PUN-2024", "Vahan Portal", today - timedelta(days=90), today + timedelta(days=275)),
            ("SPEED_GOVERNOR", "SLD-ARAI-2024-12", "Autotech SLD", today - timedelta(days=90), today + timedelta(days=275)),
        ]
        for cat, doc_num, auth, is_dt, exp_dt in docs_v3:
            db.add(VehicleDocument(
                id=str(uuid.uuid4()),
                workspace_id=ws_id,
                vehicle_id=v3_id,
                category_code=cat,
                document_number=doc_num,
                issuing_authority=auth,
                issue_date=is_dt,
                expiry_date=exp_dt,
                verification_status="verified"
            ))

        # Vehicle 4: Ashok Leyland Oyster Bus - INCOMPLETE (Missing Fitness certificate)
        v4_id = str(uuid.uuid4())
        v4 = Vehicle(
            id=v4_id,
            workspace_id=ws_id,
            registration_number="MH 12 GA 7765",
            normalized_registration_number=normalize_registration_number("MH 12 GA 7765"),
            vehicle_category="bus",
            vehicle_use="passenger_commercial",
            make="Ashok Leyland",
            model="Oyster Tourist Coach (32 Seater)",
            manufacturing_year=2021,
            fuel_type="Diesel",
            ownership_type="Owned",
            notes="32 passenger AC coach for corporate events and school excursions."
        )
        db.add(v4)

        # Assign driver 2 (Dilip Patil)
        db.add(VehicleDriverAssignment(
            id=str(uuid.uuid4()),
            workspace_id=ws_id,
            vehicle_id=v4_id,
            driver_id=driver2_id,
            is_primary=True
        ))

        # V4 Docs - Has RC, Insurance, PUC, Permit, Road Tax, but MISSING FITNESS!
        docs_v4 = [
            ("RC", "MH12GA7765/2021", "RTO Pune", today - timedelta(days=1000), today + timedelta(days=4000)),
            ("INSURANCE", "NIA-BUS-2024-0012", "New India Assurance", today - timedelta(days=120), today + timedelta(days=245)),
            ("PUC", "PUC-MH12-99881", "Bhosari Emission Station", today - timedelta(days=40), today + timedelta(days=140)),
            ("PERMIT", "PERMIT-BUS-MH-2021", "STA Maharashtra", today - timedelta(days=100), today + timedelta(days=265)),
            ("ROAD_TAX", "TAX-BUS-2025-PUN", "Vahan Portal", today - timedelta(days=30), today + timedelta(days=335)),
        ]
        for cat, doc_num, auth, is_dt, exp_dt in docs_v4:
            db.add(VehicleDocument(
                id=str(uuid.uuid4()),
                workspace_id=ws_id,
                vehicle_id=v4_id,
                category_code=cat,
                document_number=doc_num,
                issuing_authority=auth,
                issue_date=is_dt,
                expiry_date=exp_dt,
                verification_status="verified"
            ))

        # Task for V4: Book RTO Fitness Slot
        db.add(RenewalTask(
            id=str(uuid.uuid4()),
            workspace_id=ws_id,
            vehicle_id=v4_id,
            title="Upload Form 38 Fitness Certificate for MH 12 GA 7765",
            description="Vehicle passed inspection at Alandi test track. Need official Form 38 document from RTO inspector.",
            due_date=today + timedelta(days=5),
            assigned_to_user_id=user_id,
            priority="high",
            status="pending"
        ))

        # Vehicle 5: Maruti Suzuki Ertiga Tour M - COMPLIANT
        v5_id = str(uuid.uuid4())
        v5 = Vehicle(
            id=v5_id,
            workspace_id=ws_id,
            registration_number="MH 02 EE 9011",
            normalized_registration_number=normalize_registration_number("MH 02 EE 9011"),
            vehicle_category="taxi",
            vehicle_use="passenger_commercial",
            make="Maruti Suzuki",
            model="Ertiga Tour M (CNG)",
            manufacturing_year=2023,
            fuel_type="CNG",
            ownership_type="Leased",
            notes="Mumbai-Pune expressway shuttle taxi."
        )
        db.add(v5)

        docs_v5 = [
            ("RC", "MH02EE9011/2023", "Andheri RTO MH02", today - timedelta(days=300), today + timedelta(days=5000)),
            ("INSURANCE", "ICICI-ERT-2024", "ICICI Lombard", today - timedelta(days=100), today + timedelta(days=265)),
            ("PUC", "PUC-MUM-99120", "Vile Parle PUC Station", today - timedelta(days=30), today + timedelta(days=150)),
            ("FITNESS", "FORM38-MH02-2023", "Andheri RTO", today - timedelta(days=300), today + timedelta(days=430)),
            ("PERMIT", "PERMIT-CAB-MH-2023", "STA Maharashtra", today - timedelta(days=250), today + timedelta(days=115)),
            ("ROAD_TAX", "ROAD-TAX-MUM-2024", "Vahan Portal", today - timedelta(days=50), today + timedelta(days=315)),
        ]
        for cat, doc_num, auth, is_dt, exp_dt in docs_v5:
            db.add(VehicleDocument(
                id=str(uuid.uuid4()),
                workspace_id=ws_id,
                vehicle_id=v5_id,
                category_code=cat,
                document_number=doc_num,
                issuing_authority=auth,
                issue_date=is_dt,
                expiry_date=exp_dt,
                verification_status="verified"
            ))

        db.commit()
        print("Demo data seeded successfully:")
        print("  Login email: demo@sparkradar.in")
        print("  Password:    SparkRadar2026!")
        print("  Workspace:   Sahyadri Tourist Transports (5 vehicles, 3 drivers, realistic compliance states)")

    except Exception as e:
        db.rollback()
        print(f"Error seeding demo data: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed()
