
import type { AircraftData, Tool } from './types';

export const INCOMING_SALE_LIST_TEXT = `9988100-2 Data Monitor System - QTY. 1 
CJMDX34-004B Static Test Set - QTY. 1
T9-1269K Horizontal Stabilizer Trim Actuator Test Module - QTY. 1
678809-1 Throttle Quadrant Test Box - QTY. 1
 Pressure Test Adapter for RMT Model 856DF-5/-6 & Pressure Test Adapter for RMT Model 856DF-7/-8 .Both in the same case. Parts included already assembled: 
00884-0166 Pressure Sleeve QTY. 1
00884-0169 Pressure Sleeve QTY. 1 
C08099-0001 Clamp QTY. 2
C09904-0005 Fitting, PITOT QTY. 2
C09904-0004 Fitting. STATIC QTY. 3
00884-0100 STOP QTY. 5
C09846-0003 QUAD RING QTY. 4
C09846-0001 QUAD RING QTY. 2
00884-0168-0001 TEST PROBE QTY. 1
C09846-0009 QUAD RING QTY. 3
C09846-0008 QUAD RING QTY. 1
C09846-0003 QUAD RING QTY. 1
00884-0173 SLEEVE DRAIN QTY. 1
00884-0171-0001 TEST PROBE QTY. 1 
C09846-0010 QUAD RING QTY. 1
33410-125-4 Static Test Adapter QTY. 2
DME KIT CITATION X QTY. 4 Kits contain the following:
KIT (1 of 4)
9988100-7 extender card QTY. 2
F5-97-1 diagnostic cable QTY. 2
Belkin data transfer cable QTY. 1
9555024-1 AHRS Test Cable QTY. 1
6788023-1 AIS Test Cable QTY. 1
9988100-6 harness QTY. 1
1U632-601 DMU to computer cable QTY. 1
9988100-4 P3 to P4 cable QTY. 1
9988100-3 P1 to P2 cable QTY. 2
9988100-5 P7 to P8 cable QTY. 2
RLCD-SL1 QTY. 1
6788022-1 P1 to J1 cable QTY. 1
9988100-14 cable data monitor QTY. 1
9988100-9 elec. Module box lid-cabin QTY. 1
9988100-8 elec. Module box lid-baggage QTY. 1 
KIT (2 of 4)
9988100-3 P1 to P2 cable QTY. 1
9988100-5 P7 to P8 cable QTY. 2
9988100-7 extender card QTY. 4
9988100-9 elec. Module box lid-cabin QTY. 1
1U632-501 bulkhead to DMU cable QTY. 1
9988100-4 P3 to P4 cable QTY. 2
9988100-6 P5 to P6 cable QTY. 1
KIT (3 of 4) 
F5-97-1 diagnostic cable
9988100-4 P3 to P4 cable QTY. 1
9988100-3 P1 to P2 cable QTY. 1
9988100-5 P7 to P8 cable QTY. 2
9988100-6 P5 to P6 cable QTY. 1
9988100-8 elec. Module box lid-baggage QTY. 1
9988100-9 elec. Module box lid-cabin QTY. 1
KIT (4 of 4)
9988100-3 P1 to P2 cable QTY. 1
9988100-5 P7 to P8 cable QTY. 2
9988100-7 extender card QTY. 1
9988100-4 P3 to P4 cable QTY. 1
9988100-8 elec. Module box lid-baggage QTY. 2
F5-97-1 Diagnostic cable QTY. 1
9988100-6 P5 to P6 cable QTY. 1
9988100-14 cable data monitor QTY. 1 
9555024-1 AHRS Test cable QTY. 1
Also including these items not within a kit.
9988100-9 elec. Module box lid-cabin QTY. 1
9988100-8  elec. Module box lid-baggage QTY. 2`;

export const CESSNA_525_TOOLS: Tool[] = [
  { "name": "Nose Jack", "model": "02-0517-0132", "manufacturer": "N/A", "serialNumber": "N/A", "description": "Nose Jack", "calibrationStatus": "Good", "location": "BJC" },
  { "name": "Wing Jack", "model": "02-0526-0100", "manufacturer": "N/A", "serialNumber": "N/A", "description": "Wing Jack", "calibrationStatus": "Good", "location": "BJC" },
  { "name": "Wing Jack", "model": "02-0526-C0110", "manufacturer": "N/A", "serialNumber": "N/A", "description": "Wing Jack", "calibrationStatus": "Good", "location": "BJC" },
  { "name": "Tail Stand", "model": "03-5815-0000", "manufacturer": "N/A", "serialNumber": "N/A", "description": "Tail Stand", "calibrationStatus": "Good", "location": "BJC" },
  { "name": "Nose Gear Jack Pad Kit", "model": "5520151-1", "manufacturer": "N/A", "serialNumber": "N/A", "description": "Nose Gear Jack Pad Kit", "calibrationStatus": "Good", "location": "BJC" },
  { "name": "Main Gear Jack Pad", "model": "R-1798", "manufacturer": "N/A", "serialNumber": "N/A", "description": "Main Gear Jack Pad", "calibrationStatus": "Good", "location": "BJC" },
  { "name": "Heavy Duty Tow Bar", "model": "01-1101-0000", "manufacturer": "N/A", "serialNumber": "N/A", "description": "Heavy Duty Tow Bar", "calibrationStatus": "Good", "location": "BJC" },
  { "name": "Tow Bar", "model": "01-1112-0000", "manufacturer": "N/A", "serialNumber": "N/A", "description": "Tow Bar", "calibrationStatus": "Good", "location": "BJC" }
];

export const PRELOADED_AIRCRAFT_DATA: AircraftData[] = [
    {
        id: 'ac-1',
        name: 'N525AB - Citation Jet',
        createdAt: new Date().toISOString(),
        toolLists: [
            {
                id: 'list-1',
                name: '500-Hour Inspection',
                maintenanceEvent: '500-Hour Inspection',
                tools: CESSNA_525_TOOLS,
                createdAt: new Date().toISOString()
            }
        ],
        comparisons: []
    }
];
