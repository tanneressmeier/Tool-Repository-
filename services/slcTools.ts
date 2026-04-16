import type { Tool } from '../types';

// Full CSV Data containing 577 tools
const rawCsvData = `ToolTypeFullName,GroupName,NameDescription,Details,Make,Model,Serial,ToolCost,CalibrationDueDays
Non-Certified,,TL-00001 - Barfield Engine pressure tester,Model number- 2311F,Barfield,101-00211,483,$600.00,
Certified,Company Owned (SLC),TL-00002 - Gauge-Dial 0-3000 PSI (Oil Filled),"Gulstream Brake Pressure Setup box\nPG-072",Ashcroft,,T-8065,$120.00,84.0
Non-Certified,,TL-00003 - Yokogawa refrigerant gas analyzer,,Yokogawa,GA500,001388,$200.00,
Certified,Company Owned (SLC),TL-00004 - Gauge-Dial 0-3000 PSI (Air Filled),"PG-156\nBrake Bleed Tool box",TTL,,T-59209,$80.00,134.0
Non-Certified,,TL-00005 - CPS refrigerant leak-seeker,,CPS,LS780C,,$219.00,
Certified,Company Owned (SLC),TL-00006 - Gauge-Dial 0-5000 PSI (Oil Filled),,Noshok,,T11232,$50.00,329.0
Tech Tools (Cert),Ryan Christensen (RYCH),TL-00007 - Precision Measuring Tools,"Ryan's 6"" Performance Tool",Performance Tool,W80152,,$0.00,
Tech Tools (Cert),Ryan Christensen (RYCH),TL-00008 - Torque Wrenches,"10-150 Inch Pounds\n1.1-16.9 Newton Meters\nRyan Christensen personal tool",Tekton,TRQ-21101-2,,$0.00,
Certified,Company Owned (SLC),TL-00009 - Digital Gauges,"Engine 5 Point Pressure Test Gauge Box\nPG-162",Tool Testing Lab,TTL-300-HA-1,21110812002,$359.00,84.0
Certified,Company Owned (SLC),TL-00010 - Digital Gauges,"Engine 5 Point Pressure Test Gauge Box\nPG-161",Tool Testing Lab,TTL-300-HA-1,21110811002,$359.00,112.0
Certified,Company Owned (SLC),TL-00011 - Vacuum Guages,"Strut Servicing Kit\nDigital gauge",Dwyer,DPG-109,T-10569,$330.00,84.0
Certified,Company Owned (SLC),TL-00012 - Digital Protractor Pro 360,PR-003,Mitutoyo,PRO 360,T-8067,$280.00,134.0
Non-Certified,,TL-00013 - Master Heat Gun,300/500 F ,Master appliance corp.,HG-301A,,$217.00,
Certified,Company Owned (SLC),TL-00014 - Aircraft Cable Tension Tools,CT-001,Pacific Scientific,T5-2002-101-00,37376,$780.83,-4.0
Certified,Company Owned (SLC),TL-00015 - Aircraft Cable Tension Tools,CT-007,Pacific Scientific,T5-2002-104-00,57038,$780.83,328.0
Certified,Company Owned (SLC),TL-00016 - Scales not used for weighing aircraft,PPS-002,Imada,DS2-110,261241,$525.00,134.0
Certified,Company Owned (SLC),TL-00017 - Digital Milliohm Meter,Yellow case with black leather bag on top,Extech,380580,9982224,$900.00,134.0
Certified,,TL-00018 - Gauge-Dial 0-200 PSI (Oil Filled),,Tronair,HC-1386,T101495,$779.00,-728.0
Certified,Company Owned (SLC),TL-00019 - Circuit Analyzer-SureTest,,Ideal,61-164,1049185,$490.00,134.0
Non-Certified,,TL-00020 - Dayton Electric Heat Lamp,,Dayton Electric,,,$15.00,
Non-Certified,,TL-00021 - Aviron Propeller Protractor,PR-001,Aviron,36D2844,IJC-41,"$3,000.00",
Non-Certified,,TL-00022 - CPS refrigerant leak-seeker,,CPS,LS780B,,$219.00,
Non-Certified,,TL-00023 - Air conditioning service kit,,,,,$310.00,
Kit,,TL-00024 - Shadin engine trend download equipment,"2 x ETM key readers P/N - 953200-01\nFleetView disc version 7.3",,,,"$2,000.00",
Certified,Company Owned (SLC),TL-00025 - Temperature Measuring Equipment,Fluke IR thermometer,Fluke,59 MAX,9982224,$104.27,134.0
Certified,Company Owned (SLC),TL-00026 - Aircraft Cable Tension Tools,CT-008,Opti Manufacturing Corp.,T5-2002-101-00 Rev. S,73870,$280.83,85.0
Certified,Company Owned (SLC),TL-00027 - Digital Multimeter,VOM-001,Fluke,77III,70800691,$140.00,134.0
Certified,Company Owned (SLC),TL-00028 - Dial Torque Wrenches,"0-600 Inch Pounds\n0-70 Newton Meters\nTW-008",Wright Tool,3472,1112096677,$292.22,112.0
Certified,Company Owned (SLC),TL-00029 - Torque Wrenches,"200-1000 Inch Pounds\n25.4-110.2 Newton Meters\nTW-014",Snap-On,QD2R1000A,316028928,$375.00,84.0
Non-Certified,,TL-00030 - Master heat gun ,,Master appliance corp,PH-1615-1,,$285.00,
Tech Tools (Cert),Wayne Carrell (WCARR),TL-00031 - Digital Multimeter,Wayne personal tool,Fluke,115,16210029,$0.00,66.0
Non-Certified,Company Owned (SLC),TL-00032 - Carpet Knee Kicker,,Roberts,10-412,,$119.00,
Certified,Company Owned (SLC),TL-00033 - Megohmmeter,MO-002,Barfield,2471F,336,"$2,945.00",134.0
Non-Certified,,TL-00034 - Soldering iron,,Hexacon electric co ,,,$305.00,
Non-Certified,,TL-00035 - Master heat gun,,Master appliance corp,,,$217.00,
Certified,Company Owned (SLC),TL-00036 - Micrometers,"3"" - 4""\nMM-003",Starrett,No. 436,1-64.015625,$215.00,134.0
Non-Certified,,TL-00037 - Rotary Tool,,Hyper tough,AQ25025A,,$30.00,
Certified,Company Owned (SLC),TL-00038 - Aircraft Scales,Jackson load cell set for jacks. Adaptor for calibration included in carboard box.,Jackson Aircraft Weighing Systems,HH-2400-3-50RDC,16-FF4F11,"$3,200.00",147.0
Certified,Company Owned (SLC),TL-00039 - Torque Screwdrivers,5-40 Inch Pounds,Snap-On,QDRIVER4,111400999,$275.00,272.0
Certified,Company Owned (SLC),TL-00040 - Torque Wrenches,"40-200 Inch Pounds\n",Snap-On,QD1R200,0216802122,$429.00,272.0
Non-Certified,,TL-00041 - AMP crimper,,AMP,90800-1,,$185.78,
Certified,Company Owned (SLC),TL-00042 - Vacuum Gauge,"0-30 In Hg\n0-100 kPa",Marsh,34693-3,2119901,$155.00,273.0
Certified,Company Owned (SLC),TL-00043 - Torque Wrenches,"0-150 Foot Pounds\n47-197 Newton Meters",Snap-On,QD3R150A,316028018,$525.00,272.0
Certified,Company Owned (SLC),TL-00044 - Scales not used for weighing aircraft,"0-50 pound\nBlue spring scale",Yamato,T-50,40919,$54.47,272.0
Certified,Company Owned (SLC),TL-00045 - Micrometers,"5"" - 6""\nMM-004",Central Tool Co.,,T-12409,$140.00,272.0
Certified,Company Owned (SLC),TL-00046 - Precision Measuring Tools,Blue 5 piece telescoping gauge set,,,T-12399,$118.00,272.0
Certified,Company Owned (SLC),TL-00047 - Megohmmeter,"Digital Megohmmeter\nMO-003",Extech Instruments,380260,8091342,$320.00,272.0
Certified,Company Owned (SLC),TL-00048 - Micrometers,Digital Depth Micrometer,Mitutoyo,329-350-30,60003772,$720.00,272.0
Certified,Company Owned (SLC),TL-00049 - Vibration Measuring Equipment,,"Dynamic Solution Systems, Inc.",Microvib II,2842,"$15,445.00",147.0
Kit,,TL-00050 - Oil filter rinsing apparatus kit,2 black boxes ,,,,$180.00,
Certified,Company Owned (SLC),TL-00051 - Light Measuring Equipment,"Strobe Intensity Tester\nAM-100-19",Devore Aviation,FMG-4400D,1379,$439.00,690.0
Tech Tools (Cert),Brian Moczynski (BMOCZ),TL-00052 - Precision Measuring Tools,Brian's Matco Dial Caliper,Matco,DSC6628B,H34864,$0.00,272.0
Certified,Company Owned (SLC),TL-00053 - Gauge-Dial 0-300 PSI (Air Filled),,McDaniel Controls Inc,,T-6430,$38.00,-1.0
Certified,Company Owned (SLC),TL-00054 - Torque Wrenches,"60-1200 Inch Pounds\n5-100 Foot Pounds\n",Snap-On,ATECH2FR100B,314803522,$635.00,273.0
Non-Certified,,TL-00055 - Garmin servo slip clutch tester,,Garmin,011-01085-01,71110748,"$2,538.00",
Certified,Company Owned (SLC),TL-00056 - Clamp Meters,"HVAC True RMS Clamp Meter\nTB-1A",Fluke,902FC,45546234SV,$345.29,272.0
Non-Certified,,TL-00057 - DC power supply,,Ratelco,109-2046-BA,894011,"$1,665.00",
Non-Certified,,"TL-00058 - DC Power Supply\n",DCPS-001,Volteq,HY3005D-3,170306324,$199.95,
Non-Certified,,TL-00059 - Plum bob/line,,,,,$10.00,
Non-Certified,,TL-00060 - Soldering kit ,,,,,$150.00,
Non-Certified,,TL-00061 - LCD Soldering Station,,Velleman,VTSSC40NU,1410343,$119.95,
Certified,Company Owned (SLC),TL-00062 - Digital Multimeter,Not accounted for (Missing),,,100609684,$0.00,-200.0
Non-Certified,,TL-00063 - Test Lamp Set,Shop made,,,,$20.00,
Non-Certified,,TL-00064 - 37 Degree Double Flaring Tool,,Old Forge Tools,7209,,$30.00,
Certified,Company Owned (SLC),TL-00065 - Digital Gauges,"Engine 5 Point Pressure Test Gauge Box\nPG-169",Cecomp Electronics,DPG1000B140INH2OG-5,S00321301001,$523.30,329.0
Certified,Company Owned (SLC),TL-00066 - Digital Gauges,"Engine 5 Point Pressure Test Gauge Box\nPG-090",Cecomp Electronics,DPG1000B140INH2OG-5,5892601001,$423.30,329.0
Certified,Company Owned (SLC),TL-00067 - Gauge-Dial 0-3000 PSI (Air Filled),"PG-157\nO2 push cart",TTL,,T-59210,$70.00,141.0
Certified,,TL-00068 - Digital Gauges,0-30 DPG,Dwyer,DPG-003,S152980,$350.94,
Certified,Company Owned (SLC),TL-00069 - Gauge-Dial 0-3000 PSI (Air Filled),PG-065,McDaniel Controls Inc,,T-7415,$47.34,37.0
Certified,Company Owned (SLC),TL-00070 - Gauge-Dial 0-300 PSI (Air Filled),,,,PG-144,$40.00,-200.0
Certified,Company Owned (SLC),TL-00071 - Precision Measuring Tools,"G150/G200 Static Port Dial Indicator and Standard\nDI-003",Mitutoyo,No. 1168,FYE208,$142.00,272.0
Certified,Company Owned (SLC),TL-00072 - Digital Gauges,"Cabin Pressurization\n0-30 psi\nPG-116",Dwyer,DPG-003,T-14381,$322.00,325.0
Certified,Company Owned (SLC),TL-00073 - Flow Measuring Devices,FM-001,Badger Meter,H271A-005,70815,$570.33,65.0
Non-Certified,,TL-00074 - Stamp Die Set,"0-8\nA-Z\n&",,,,$186.67,
Certified,Company Owned (SLC),TL-00075 - Precision Measuring Tools,"Red Starrett dial indicator kit\nDI-001",Starrett,No. 196,,$482.62,328.0
Certified,Company Owned (SLC),TL-00076 - Torque Screwdrivers,"0-100 Inch Ounces\nTW-007",Proto,6104,4336,$441.63,329.0
Certified,Company Owned (SLC),TL-00077 - Scales not used for weighing aircraft,"DS-001\nIn foam cutout",Taylor,TE10C,,$94.61,329.0
Non-Certified,,TL-00078 - Imperial Flaring Tool,37 degree,Imperial,507-FB,,$623.47,
Certified,Company Owned (SLC),TL-00079 - Precision Measuring Tools,"Dial Indicator in red Starrett box\nDI-004",Mitutoyo,81-141J,292732,$291.96,328.0
Certified,Company Owned (SLC),TL-00080 - Gauge-Dial 0-4000 PSI (Air Filled),PG-068,McDaniel Controls Inc,,T-7779,$18.37,-1.0
Certified,Company Owned (SLC),TL-00081 - Gauge-Dial 0-600 PSI (Air Filled),,,,T-12363,$83.48,-1.0
Tech Tools (Cert),Wayne Carrell (WCARR),TL-00082 - Gauge-Dial 0-300 PSI (Air Filled),Wayne's personal tool ,,,PG-WC-001,$0.00,-47.0
Certified,Company Owned (SLC),TL-00083 - Belt Tension Measuring Tools,"Sonic Tension Meter\nBTM-002",Gates,507C,B1247007,"$2,893.27",328.0
Certified,Company Owned (SLC),TL-00084 - Torque Wrenches,"50-250 Foot Pounds\n60-330 Newton Meters\nTW-003",Snap-On,TQFR250C,73244,$535.00,328.0
Tech Tools (Cert),Wayne Carrell (WCARR),TL-00085 - Precision Measuring Tools,"Wayne's personal 6"" digital caliper",Fowler,"6"" Digital Caliper",1105B23378,$0.00,-4.0
Certified,Company Owned (SLC),TL-00086 - Belt Tension Measuring Tools,BTM-001,Check Line,BTM-400PLUS,122-TR9539,"$1,333.85",329.0
Certified,Company Owned (SLC),TL-00087 - Dial Torque Wrenches,"0-75 Inch Pounds\nTW-016",Snap-On,TE6A,28029,$426.00,329.0
Certified,Company Owned (SLC),TL-00088 - Light Measuring Equipment,"LCR Meter\nLCR-001",BK Precision,879B,127D17179,$430.00,39.0
Certified,Company Owned (SLC),TL-00089 - Gauss Meter,"Small gauge in small cardboard box\nIndicates Residual Magnetism in Ferrous Material\nMD-003",Magnetic Analysis Corp,DET-432,0295,$95.00,39.0
Certified,Company Owned (SLC),TL-00090 - Digital Protractor Pro 360,PR-004,Insize,2173-360,2709145093,$240.77,328.0
Certified,Company Owned (SLC),TL-00091 - Temperature Measuring Equipment,Digital Turbine Temperature Test Set,Barfied,101-00901,5407,"$4,500.00",328.0
Certified,Company Owned (SLC),TL-00092 - Clamp Meters,True RMS Clamp Meter,Fluke,365,55060102WS,$324.07,328.0
Certified,Company Owned (SLC),TL-00093 - Force Gauges,,Nidec Shimpo,FGV-100XY,Y9515G528,$853.85,66.0
Certified,Company Owned (SLC),TL-00094 - Gauge-Dial 0-4000 PSI (Air Filled),PG-160,Tool Testing Lab,T-41670,,$24.57,329.0
Certified,Company Owned (SLC),TL-00095 - Light Measuring Equipment,Digital stroboscope,Digital Instruments,840009,I.594972,$205.99,216.0
Certified,Company Owned (SLC),TL-00096 - Digital Multimeter,"Black case VOM-003 & HD-001\nVOM-003\n",Fluke,116,462406755V,$319.98,66.0
Certified,Company Owned (SLC),TL-00097 - Temperature Measuring Equipment,"Black case VOM-003 & HD-001\nRelative Humidity/Temperature Meter\nHD-001",Amprobe,TH-1,19070035,$148.96,66.0
Certified,Company Owned (SLC),TL-00098 - Micrometers,"Digital Micrometer 1"" - 2""\nMM-006",Insize,3109,101094402,$183.67,-4.0
Certified,Company Owned (SLC),TL-00099 - Electrical Tools,,,,AD-1377S,$314.46,-4.0
Certified,Company Owned (SLC),TL-00100 - Electrical Tools,,,,DMC-001,$349.00,66.0
Certified,Company Owned (SLC),TL-00101 - Electrical Tools,,,,DMC-009,$350.00,-4.0
Certified,Company Owned (SLC),TL-00102 - Electrical Tools,,,,WS-001,$280.00,-4.0
Certified,,TL-00103 - Gauge-Dial 0-4000 PSI (Air Filled),,USG,BU-2581-AM,,$50.00,329.0
Non-Certified,,TL-00104 - Impact Ram-Dent Crimp Tool,8-4/0 AWG,ETC,,,$25.00,
Certified,Company Owned (SLC),TL-00105 - Scales not used for weighing aircraft,"Push Pull Gauge\nPPS-004",Imada,DS2-110,340768,$536.40,-4.0
Certified,Company Owned (SLC),"TL-00106 - DC Power Supply\nDCPS-002",,Extech,382260,G341212556,$281.00,-4.0
Certified,Company Owned (SLC),TL-00107 - DC Power Supply,DCPS-003,Tekpower,TP-3005D-3,718211,$393.75,-4.0
Certified,Company Owned (SLC),TL-00108 - Click Bond Tester,,,,50235773,$367.86,-4.0
Non-Certified,,TL-00109 - Tap and Die Set SAE,,Craftsman,52382,1499452382,$125.00,
Non-Certified,,TL-00110 - Tap and Die Set SAE,,Surebilt,98094,,$55.00,
Certified,Company Owned (SLC),TL-00111 - Battery Charger-Analyzer,Lead Acid battery cage,JFM,Mastercharger ,0909-8R3-00421,"$24,725.00",289.0
Certified,Company Owned (SLC),TL-00112 - Battery Charger,Lead Acid battery cage,Aeroquality,24-400,8349-2822,"$1,482.00",289.0
Certified,Company Owned (SLC),TL-00113 - Battery Charger,Lead Acid battery cage,Aeroquality,24-400L,9609-106-0361,"$3,000.00",289.0
Certified,Company Owned (SLC),TL-00114 - Battery Charger,NiCad battery cage,JFM,Superseder IIA,9041-903-8275,"$22,797.72",289.0
Certified,Company Owned (SLC),TL-00115 - Battery Charger,Lead Acid battery cage,JFM,Superseder IIA,9525-903-11726,"$22,797.72",289.0
Non-Certified,,TL-00116 - Tap and Die Set Metric,,Craftsman,53244,1499452344,$50.00,
Certified,Company Owned (SLC),TL-00117 - Electrical Tools,,,,DMC-002,$800.00,51.0
Non-Certified,,TL-00118 - Slide hammer kit,,,,,$126.00,
Non-Certified,,"TL-00119 - 3 1/2"" 6 point socket\n",Legacy 650 main wheel,Blue Point,ANS1910A,45-1210-1801-694,$80.00,
Non-Certified,,"TL-00120 - 2 7/8"" 6 point socket",,OTC,1932,,$40.00,
Certified,Company Owned (SLC),TL-00121 - Electrical Tools,"Red handle crimp tool 10-22 gage\nDMC-003",DMC,GMT1006,11851,$310.00,134.0
Certified,Company Owned (SLC),TL-00122 - Electrical Tools,Red handle 12-26 gage crimper,Sargent Tools,,KACT004,$194.00,-4.0
Non-Certified,,"TL-00123 - 2 7/8"" 6 point socket",,,GAEC1159SE,M20092-11,$100.00,
Non-Certified,,"TL-00124 - 2 1/2"" 6 point socket",,OTC,1921,,$40.00,
Non-Certified,,"TL-00125 - 2 1/2"" 12 point socket",,,,,$15.00,
Non-Certified,,"TL-00126 - 2 3/8"" 12 point socket",,,,,$15.00,
Non-Certified,,"TL-00127 - 2 1/4"" 6 point socket",,,3072R,,$50.00,
Certified,Company Owned (SLC),TL-00128 - Gauge-Dial 0-3000 PSI (Air Filled),"PG-082\nO2 Cart H4\n",McDaniel Controls Inc,,T-8479,$14.32,37.0
Certified,Company Owned (SLC),TL-00129 - Gauge-Dial 0-3000 PSI (Air Filled),"PG-142\nBrake Bleed Tool box",TTL,,T-24892,$200.00,84.0
Certified,Company Owned (SLC),TL-00130 - Gauge-Dial 0-300 PSI (Air Filled),"PG-155\nCombo Pumper Cart",TTL,,T-40370,$28.55,37.0
Certified,Company Owned (SLC),TL-00131 - Belt Tension Measuring Tools,BTM-003,OTC,6673,59939,$210.00,66.0
Certified,,TL-00132 - Gauge-Dial 0-300 PSI (Air Filled),PG-166,Tool Testing Lab,,T-41875,$50.00,328.0
Non-Certified,,"TL-00133 - 2 1/8"" 12 point socket",,,,,$20.00,
Non-Certified,,TL-00134 - Pilatus PC 12 Nose Wheel Socket,,,,,$30.00,
Certified,Company Owned (SLC),TL-00135 - Gauge-Dial 0-300 PSI (Air Filled),,,,T-40358,$50.00,66.0
Certified,Company Owned (SLC),TL-00136 - Gauge-Dial 0-4000 PSI (Air Filled),,USG,BU-2581-AQ,,$50.00,66.0
Certified,Company Owned (SLC),TL-00137 - AAIR Seatbelt Airbag Diagnostic Tool,"AmSafe Aviation Inflatable Restraint System Diagnostic Tool - Type II Kit\nSB-001",AmSafe,508987-401,49,"$5,812.49",349.0
Certified,Company Owned (SLC),TL-00138 - Diagnostic tools and test boxes,,,508668-201,278,"$5,812.49",-307.0
Non-Certified,,"TL-00139 - 2"" 12 point socket",,,,,$20.00,
Non-Certified,Company Owned (SLC),TL-00140 - Safe-T-Cable Application Tools,,DMC,,SCTR327,$900.00,
Non-Certified,Company Owned (SLC),TL-00141 - Torque Attachments,"Jumbo Size Crowfoot Wrench Set\n1/2"" drive\nSAE 1-1/16"" - 2""",Neiko,03325A,,$135.99,
Non-Certified,Company Owned (SLC),TL-00142 - Video Borescopes,"Yellow case borescope\nBorescope is calibrated with each use against provided calibration block",GE,XLGOC5020,13080000000000,"$13,995.99",
Certified,Company Owned (SLC),TL-00143 - Torque Wrenches,"Digital\n60-1200 Inch Pounds\n5-100 Foot Pounds\nTW-002",Snap-On,ATECH2FS100,422106070,$336.84,328.0
Certified,Company Owned (SLC),TL-00144 - Torque Wrenches,"40-250 Foot Pounds\n60-340 Newton Meters\nTW-001",Snap-On,TQFR250E,1013800972,$550.00,328.0
Certified,Company Owned (SLC),TL-00145 - Micrometers,"0"" - 1""\nMM-001",,,,$80.00,134.0
Certified,Company Owned (SLC),TL-00146 - Digital Gauges,PG-146,Ashcroft,DG-25,15022608001,$330.00,134.0
Certified,Company Owned (SLC),TL-00147 - Gauge-Dial 0-4000 PSI (Air Filled),"Gulfstream Brake Pressure Setup box\nGT101",,,,$55.00,141.0
Certified,,TL-00148 - Gauge-Dial 0-6000 PSI (Air Filled),,USG,BU-2581-CY,,$56.00,329.0
Certified,Company Owned (SLC),TL-00149 - Gauge-Dial 0-3000 PSI (Air Filled),Combo Pumper Cart,USG,,,$57.12,134.0
Non-Certified,,"TL-00150 - 2"" 12 point socket\n",Pilatus,Evercraft,775-1864,,$20.00,
Tech Tools (Cert),Brian Moczynski (BMOCZ),TL-00151 - Torque Wrenches,"20-200 Inch Pounds\nBrian's Harbor Freight Torque Wrench",Pittsburgh,63881,353992143,$0.00,272.0
Certified,Company Owned (SLC),TL-00152 - Gauge-Dial 0-300 PSI (Air Filled),Nitrogen Cart H4,TTL,,T-50145,$28.58,37.0
Non-Certified,Company Owned (SLC),TL-00153 - Williams Engine Tools,Fuel Nozzle Adapter Tool,,,TL-99517,"$1,200.00",
Certified,Company Owned (SLC),TL-00154 - Temperature Measuring Equipment,Digital Thermometer/Pyrometer,TIF,TIF7000,100080146423,$120.00,272.0
Non-Certified,,"TL-00155 - 2"" 12 point socket",,,,,$20.00,
Certified,Company Owned (SLC),TL-00156 - Digital Gauges,"Engine 5 Point Pressure Test Gauge Box\n",Dwyer,DPG-007,IP74708-11,$350.00,325.0
Certified,Company Owned (SLC),TL-00157 - Gauge-Dial 0-3000 PSI (Air Filled),,TTL,,T-44734,$25.00,329.0
Non-Certified,,"TL-00158 - 1 15/16"" 6 point socket",,,3062R,,$40.00,
Certified,Company Owned (SLC),TL-00159 - Gauge-Dial 0-3000 PSI (Air Filled),,,,T-8227,$50.00,329.0
Non-Certified,,TL-00160 - GLEX Elevator Leak Check Cable,,Bombardier,G700-271103-1,230299-011,"$2,475.08",
Certified,Company Owned (SLC),TL-00161 - Precision Measuring Tools,DI-007,Mitutoyo,S112TX,15212801,$225.00,272.0
Non-Certified,Company Owned (SLC),TL-00162 - Honda Tooling,"Insulation Resistance Test Harness\nZiploc bag",,GAI-SB-420-32-012,GAI-SB-420-32-012,$150.00,
Certified,Company Owned (SLC),TL-00163 - Gauge-Dial 0-300 PSI (Air Filled),"Strut Servicing Kit\nPG-139",Tool Testing Lab,,T-27430,$60.00,-299.0
Certified,Company Owned (SLC),TL-00164 - Gauge-Dial 0-4000 PSI (Air Filled),"Hangar 4 O2 Cart 4 Bottle\nPG-006",USG,BU-2581-AQ,PG-006,$31.65,66.0
Certified,Company Owned (SLC),TL-00165 - Gauge-Dial 0-300 PSI (Air Filled),QD service thing,,,T-49402,$28.58,-1.0
Certified,Company Owned (SLC),TL-00166 - Gauge-Dial 0-5000 PSI (Air Filled),PG-004,Wika,111 11 53 6000,PG-004,$35.00,329.0
Certified,Company Owned (SLC),TL-00167 - Gauge-Dial 0-4000 PSI (Air Filled),Inside black box on combo pumper cart,,,PG-003,$31.65,-1.0
Non-Certified,Company Owned (SLC),TL-00168 - Measuring tools for reference only,,,,T-42672,$62.00,
Non-Certified,Company Owned (SLC),TL-00169 - Measuring tools for reference only,,,,TDS-3,$15.99,
Kit,Company Owned (SLC),TL-00170 - Rig pin set,"401-590003-0027 Quantity: 2\n401-590003-0025 Quantity: 2\n401-590003-0029 Quantity: 2\n401-590003-0017\n401-590003-0019\n401-590003-0023 Quantity: 2\n401-590003-0039\n401-590003-0031\n",,,,"$2,788.28",
Certified,Company Owned (SLC),TL-00171 - Scales not used for weighing aircraft,,Taylor Professional,TE22FT,,$118.00,5.0
Non-Certified,Company Owned (SLC),TL-00172 - Video Borescopes,"Black case borescope\nBorescope is calibrated with each use against provided calibration block",Olympus,iPlex LX,Y90T037,"$12,999.99",
Certified,Company Owned (SLC),TL-00173 - Analog Multimeters,VOM-002,Simpson,260,IW0003,$535.37,98.0
Non-Certified,Company Owned (SLC),"TL-00174 - 1 7/8"" 12 point socket",,Evercraft,775-1860,,$20.00,
Non-Certified,Company Owned (SLC),TL-00175 - Global/CRJ Jack Pads,,,,92A99101-8,$107.00,
Non-Certified,Company Owned (SLC),TL-00176 - Jack Pads,,,,R-1807,$0.00,
Non-Certified,Company Owned (SLC),TL-00177 - Safe-T-Cable Application Tools,,,,SCTR323,$533.58,
Non-Certified,Company Owned (SLC),TL-00178 - Safe-T-Cable Application Tools,,,,SCTR203,$889.30,
Non-Certified,Company Owned (SLC),TL-00179 - Safe-T-Cable Application Tools,,,,SCTR207,$533.58,
Non-Certified,Company Owned (SLC),TL-00180 - Challenger Jack Pads,,,,,"$1,048.95",
Non-Certified,Company Owned (SLC),TL-00181 - Tail Stand,,Tronair,03-5800-0010,1370079409,"$2,945.08",
Non-Certified,Company Owned (SLC),TL-00182 - Tire Bead Breaker,,Tronair,14-6801-0120,AA11870207,"$5,833.59",
Non-Certified,Company Owned (SLC),TL-00183 - Jack Pads,,,,1159SEM20008,$0.00,
Non-Certified,Company Owned (SLC),TL-00184 - Jack Pads,,,,6,$0.00,
Non-Certified,Company Owned (SLC),TL-00185 - Jack Pads,,,,7,$0.00,
Non-Certified,,TL-00186 - Jack Accessory no individual price,,,,,$720.00,
Non-Certified,Company Owned (SLC),"TL-00187 - Jack Accessory no individual price\n",,,,,$0.00,
Non-Certified,Company Owned (SLC),TL-00188 - Nitrogen Cart,,Tronair,12-3103-6000,1634249811,$0.00,
Non-Certified,Company Owned (SLC),TL-00189 - Hawker 125 Series Jack Pads,,British Aerospace,25Y67A,,$357.19,
Non-Certified,Company Owned (SLC),TL-00190 - Slide hammer,,,,,$126.00,
Non-Certified,,"TL-00191 - 1 7/8"" 12 point socket",,,,,$30.00,
Non-Certified,Company Owned (SLC),"TL-00192 - 1 5/8"" 12 point socket",,,,,$25.00,
Non-Certified,Company Owned (SLC),"TL-00193 - 1 13/16"" 12 point socket ",,Proto Professional,5558,,$55.00,
Non-Certified,Company Owned (SLC),TL-00194 - MARTS box engine simulation,,Kell-strom,2C82130,VT02815001,$650.00,
Certified,,TL-00195 - Torque Wrenches,"10-150 Inch Pounds\n1.1-16.9 Newton Meters",Tekton,TRQ-21101-2,,$131.00,
Certified,Company Owned (SLC),TL-00196 - Diagnostic tools and test boxes,"Fuel Quantity Test Set\nYellow case",JcAIR,PSD60-2R,J285,"$11,795.00",77.0
Non-Certified,Company Owned (SLC),TL-00197 - Turnbuckle Tool,,Yardstore,50083,,$47.00,
Non-Certified,Company Owned (SLC),TL-00198 - Windshield Tooling,"Surface Seal Kit\nHuge blue rolling case under table",PPG,DSS1000,08163H8410,"$5,995.00",
Non-Certified,Company Owned (SLC),TL-00199 - Air Data Tools and Accessories,"G280 Air Data Kit for standard and RVSM testing\nSilver locking case under table",Nav-Aids LTD,ADAG280-945,4294,"$2,500.00",
Non-Certified,Carson Johnston (CJOHN),TL-00200 - Global Express Rig Pins,,Bombardier,G700-271103-31,FSB088015-05,"$3,074.00",
Non-Certified,Company Owned (SLC),TL-00201 - Rig Pins,,Hondajet,HJT2700-000-3RP-CS,19,"$9,972.60",
Non-Certified,Company Owned (SLC),TL-00202 - Pratt and Whitney engine tooling,"PT-6 puller kit\nAM-100-07\nRed case under table",Turbine Tool,PWC5201,1102501,$0.00,
Non-Certified,Company Owned (SLC),TL-00203 - APU removal and installation kit,,Bombardier,G604-490001-77,13,"$6,680.00",
Non-Certified,Company Owned (SLC),TL-00204 - Engine sling,,Tronair,08-0102-1000,891-17250,"$3,560.44",
Non-Certified,Company Owned (SLC),TL-00205 - Hawker Rig Pins,,British Aerospace,25 8Y 59-1A,,"$2,130.47",
Non-Certified,Company Owned (SLC),TL-00206 - Hawker Rig Pins,,British Aerospace,25 8Y 59-1A,,"$2,130.47",
Non-Certified,Company Owned (SLC),TL-00207 - Hawker Strut Service Hoses,,,,,$250.00,
Certified,Company Owned (SLC),TL-00208 - Air Data,"Pitot Static/Air Data test set\nYellow case with black saddlebag",ATEQ,ADSE 743,1257,"$21,859.00",281.0
Tech Tools (Cert),Reilyn Larsen (RLARS),TL-00209 - Torque Wrenches,"20-100 FT LBs\nReilyn's personal torque wrench",Husky,564394,423052854,$0.00,328.0
Certified,,TL-00210 - Gauge-Dial 0-4000 PSI (Air Filled),PG-151,Tool Testing Lab,,T-27342,$55.00,329.0
Non-Certified,Company Owned (SLC),"TL-00211 - 1 9/16"" 12 point socket",,Snap-on,LDH502,,$113.50,
Non-Certified,Company Owned (SLC),"TL-00212 - 1 7/16"" 12 point socket",,Keystone Aviation ,,,$10.00,
Non-Certified,Company Owned (SLC),"TL-00213 - 1 3/8"" 6 point socket",,Napa,NTPD644,,$45.00,
Non-Certified,Company Owned (SLC),"TL-00214 - 1"" Ratchet",,,,,$312.78,
Non-Certified,,"TL-00215 - 1"" adapter",,Proto ,07635,,$40.00,
Non-Certified,Company Owned (SLC),"TL-00216 - 1 9/16"" crows foot",,Snap-on,FC50A,,$59.50,
Non-Certified,Company Owned (SLC),TL-00217 - Gulfstream Strut Spline Wrench,,Keystone Aviation,,,"$4,680.00",
Non-Certified,Company Owned (SLC),TL-00218 - Piaggio 180 Beta Ring Puller,,Keystone aviation,,,$200.00,
Non-Certified,Company Owned (SLC),TL-00219 - K002,Large cabin Gulfstream nose steering,Keystone Aviation,,,$975.00,
Non-Certified,Company Owned (SLC),TL-00220 - K003,Large cabin Gulfstream nose steering collar,Keystone aviation,,,"$1,800.00",
Non-Certified,Company Owned (SLC),"TL-00221 - 1/4"" tube bender",,Imperial,364 FHB 1-4,,$120.53,
Non-Certified,Company Owned (SLC),"TL-00222 - 3/16"", 1/4"", 5/16"", 3/8"" tube bender",,Blue-Point,TBS-200,,$92.75,
Non-Certified,Company Owned (SLC),TL-00223 - Self Adjusting Pliers,,Quinn,,,$10.00,
Non-Certified,,"TL-00224 - 1/2"" tube bender",,Rigid,,,$149.76,
Non-Certified,Company Owned (SLC),"TL-00225 - 1 1/2"" wrench",,Pittsburgh,,,$11.00,
Non-Certified,Company Owned (SLC),"TL-00226 - 1 3/4"" wrench",,Pittsburgh,,,$11.00,
Non-Certified,Company Owned (SLC),TL-00227 - 1 5/16” Combination Wrench,,Wright,,,$11.00,
Non-Certified,Company Owned (SLC),"TL-00228 - 1 3/8"" Combination Wrench",,Pittsburgh,,,$11.00,
Non-Certified,Company Owned (SLC),"TL-00229 - 1 5/8"" wrench",,Pittsburgh,,,$11.00,
Non-Certified,Company Owned (SLC),TL-00230 - Gulfstream water filter wrench,,,,07-132500-001,"$4,102.14",
Non-Certified,Company Owned (SLC),TL-00231 - 1/4” Drive Sliding Breaker Bar,,Proto Professional,5485,,$47.37,
Non-Certified,Company Owned (SLC),"TL-00232 - 1/2"" Drive Sliding Breaker Bar",,,,,$87.45,
Non-Certified,Company Owned (SLC),"TL-00233 - 3/8"" drive adjustable torque wrench adapter",,Motion Pro,08-0380,,$66.99,
Non-Certified,Company Owned (SLC),"TL-00234 - 1 1/8"" torque adapter ",,Snap-on,SRDH361,,$66.50,
Non-Certified,Company Owned (SLC),TL-00235 - Hawker main wheel axle nut spanner,,Hawker,125-324028,,$187.00,
Non-Certified,Company Owned (SLC),"TL-00236 - Pilatus AOA Calibration Fixture\n",2 parts,Pilatus,513.22.12.055,,"$4,000.00",
Non-Certified,Company Owned (SLC),TL-00237 - Engine hoist chain kit,,,,,$50.00,
Non-Certified,Company Owned (SLC),TL-00238 - Engine sling chains,,,,,$100.00,
Certified,Company Owned (SLC),TL-00239 - Garret/Honeywell 731 J2 Connector Test Box,,,,,$275.00,
Non-Certified,Company Owned (SLC),TL-00240 - Stall Ident Maintenance Test Box,,Hawker,25YTS340E1A,CHEV141,$950.00,
Non-Certified,Company Owned (SLC),TL-00241 - Hawker Brake Spring Strut Tool,,Keystone,,K021,$50.00,
Non-Certified,,TL-00242 - Hawker AOA Protractor,Left and Right side,Hawker,258Y1211A,,"$1,800.00",
Kit,,"TL-00243 - Hawker Static Adapters\n","P/N 21290GR45-180-4 Quantity: 2\nP/N 21298M-180-4 Quantity: 1",,,,"$1,281.00",
Non-Certified,Company Owned (SLC),"TL-00244 - 1/2"" Drive Sliding Breaker Bar",,Britool,E70,,$30.14,
Non-Certified,,TL-00245 - Hawker main wheel spanner,,Hawker,25.Y.725.A,,$479.99,
Non-Certified,Company Owned (SLC),TL-00246 - Hawker Main Wheel Spanner,,Hawker,25.Y.725.A,,$479.99,
Non-Certified,,TL-00247 - Hawker Spanner Wrench,,Hawker,25.Y.257.A,,$500.00,
Non-Certified,Company Owned (SLC),TL-00248 - Hawker Spanner Wrench,,Hawker ,25.Y.257.A,,$500.00,
Non-Certified,Company Owned (SLC),TL-00249 - Hawker Spanner Wrench,,Hawker,25.Y.257.A,,$500.00,
Non-Certified,Company Owned (SLC),TL-00250 - Hawker Spanner Wrench,,Hawker,25.Y.613A/B,,$40.00,
Non-Certified,Company Owned (SLC),TL-00251 - Hawker Extinguisher Test Lamps/Fuses,,,,,$40.00,
Non-Certified,Company Owned (SLC),TL-00252 - Hawker 900XP TKS tool,,Hawker,25-9Y215-1A,,$300.00,
Non-Certified,Company Owned (SLC),"TL-00253 - Hawker APU Exciter Box Tester\n",,Keystone,K-038,,$308.00,
Non-Certified,Company Owned (SLC),TL-00254 - Hawker Torque Link Bushing Reamer,,Northwest Precision,25Y2001,J6568,"$2,200.00",
Kit,Company Owned (SLC),TL-00255 - Hawker Ventral Tank Pressurization Kit,,,,,$80.00,
Non-Certified,Company Owned (SLC),TL-00256 - Digital Manometer,,UEI,EM201B,,$211.00,
Non-Certified,Company Owned (SLC),TL-00257 - Hawker Hand Tools,,King Dick,,,$400.00,
Non-Certified,Company Owned (SLC),TL-00258 - Lear Jack Pads,,,,,"$1,200.00",
Non-Certified,,TL-00259 - Engin Spline Drive Tools,,,,,$75.00,
Non-Certified,Company Owned (SLC),TL-00260 - Phenom 100 Jack Pads,,Embraer,AGE-04510-401,,"$1,600.00",
Non-Certified,Company Owned (SLC),TL-00261 - Phenom 300 Jack pads,,Embraer,AGE-04890-401,,"$1,600.00",
Non-Certified,Company Owned (SLC),"TL-00262 - Westwind Jack Pads\n","253532-1/D\n253533-1/C\n030007-100\n030008-100",,,,"$2,000.00",
Non-Certified,,TL-00263 - Phenom 100 NLG Axle Jack Adaptor,,Tronair,2310-T030-401,5175150201,"$5,500.00",
Non-Certified,Company Owned (SLC),TL-00264 - Fuel Quantity Test Set,"Capacitance type\nGTF-2",Gull Airborne Instruments Inc.,361-012-001,2641264,"$20,000.00",
Non-Certified,Company Owned (SLC),TL-00265 - Pneumatic Jack Hose Set,"3 hoses\n1 splitter",Tronair,K-1106,0352080301,"$2,686.90",
Non-Certified,Company Owned (SLC),TL-00266 - TBM Stab Tap Test Set,Horizontal and vertical stabilizer tap test/ultrasonic references and hammer,Socata,T700A5199001010,,"$1,500.00",
Non-Certified,Company Owned (SLC),TL-00267 - Spline Gauge,maybe,,30499-50,,$40.00,
Non-Certified,Company Owned (SLC),TL-00268 - PT6 Comp Wash Adaptor,,Kell-Strom,PWC32271,,$485.00,
Non-Certified,Company Owned (SLC),TL-00269 - ULB Battery Tester,Pinglite,Dukane,PL-1,,$350.00,
Non-Certified,Company Owned (SLC),TL-00270 - PWC Pusher Tool,Garlock seal installation,Kell-Strom,PWC60682,,"$2,380.61",
Non-Certified,,TL-00271 - Analog Borescope,Non-digital borescope with flashlight tip. Like a periscope!,Provision,636,,$626.00,
Non-Certified,Company Owned (SLC),TL-00272 - Extractor,Seal,,PWC31382-02,S39687,$563.00,
Non-Certified,Company Owned (SLC),TL-00273 - PWC Puller,Starter seal puller,Kell-Strom,PWC67620-1,,$500.00,
Non-Certified,Company Owned (SLC),TL-00274 - PWC Puller,Oil Seal Carrier,Kell-Strom,PWC70838,4501529764-20,$663.33,
Non-Certified,Company Owned (SLC),TL-00275 - PWC Puller Shield,,,PWC61951,JE316,$722.27,
Non-Certified,Company Owned (SLC),TL-00276 - PWC Puller Shield,,Kell-Strom,PWC61951,,$722.27,
Non-Certified,Company Owned (SLC),TL-00277 - PT6 Borescope Guide,,,PWC34910-200,S03044,$449.00,
Non-Certified,Company Owned (SLC),TL-00278 - PT6 Borescope Guide,,Kell-Strom,PWC34910-400,,$459.00,
Non-Certified,Company Owned (SLC),TL-00279 - PT6 Borescope Guide,,,PWC34910-600,S03044,$489.00,
Non-Certified,Company Owned (SLC),TL-00280 - PW308 Borescope Guide,4th stage HP rotor,Keystone,,,$450.00,
Non-Certified,Company Owned (SLC),TL-00281 - Borescope Guide,,Kell-Strom,PWC62193,,$480.00,
Non-Certified,Company Owned (SLC),TL-00282 - Prop Ring Puller,,,TK1573-918,,"$2,516.48",
Non-Certified,Company Owned (SLC),"TL-00283 - Puller\n","K-044\nBeta ring",,375-C BETA,,$550.00,
Non-Certified,Company Owned (SLC),"TL-00284 - Puller\n","PC-12, TBM, TBM 5, PA-46",Keystone,K-005,,"$2,500.00",
Non-Certified,Company Owned (SLC),TL-00285 - Puller,blue,Keystone,,,"$2,500.00",
Non-Certified,Company Owned (SLC),TL-00286 - PWC UART Download Cables,Cessna 560XL,Pratt & Whitney,PWC67398,,"$3,800.00",
Non-Certified,Company Owned (SLC),TL-00287 - PT6 Power Section Sling,,Textron,PWC70104,AA9226,"$5,369.82",
Non-Certified,Company Owned (SLC),TL-00288 - Pratt & Whitney Pulling Set,"PWC34062\nPWC34060\nPWC30328-100\nPWC34161-A\nPWC30373-A\nPWC30128-04\nWaiting for quote",Kell-strom,,,$0.00,
Non-Certified,Company Owned (SLC),TL-00289 - Main Gear Simulator,Cessna 560,,6688002-1,,"$3,241.00",
Non-Certified,Company Owned (SLC),TL-00290 - Cessna Citation landing gear oleo strut reseal fixtures,,Textron,CJMD132-003,,"$2,039.33",
Non-Certified,Company Owned (SLC),TL-00291 - AC Phase Sequence Indicator,,Tegam,T470,,$100.00,
Non-Certified,Company Owned (SLC),TL-00292 - Cessna Fuel Quantity Test Box,,Cessna,0580001-1,,"$1,258.47",
Non-Certified,Company Owned (SLC),TL-00293 - Citation 560 Static Port Inspection Tool,,,6580016-2,,$277.95,
Non-Certified,Company Owned (SLC),"TL-00294 - C560 T/R Test Box\n",K-036,Keystone,,,$0.00,
Non-Certified,Company Owned (SLC),TL-00295 - CJ-3 Outflow Valve Test Line,,Keystone,,,$40.00,
Non-Certified,Company Owned (SLC),TL-00296 - CJ-3 trunion pin tool,,,,,$70.00,
Non-Certified,Company Owned (SLC),"TL-00297 - PC12 Horizontal Stabilizer pivot bush tool kit\nK007",,,,,$0.00,
Non-Certified,Company Owned (SLC),TL-00298 - Cessna Jack Pads,Some combination of these makes each set required for any Cessna Jet except 750,Cessna,,,"$2,449.26",
Non-Certified,Company Owned (SLC),TL-00299 - C-560 Axle Jack Adapter,,,CJMD207-003,,"$3,015.54",
Non-Certified,Company Owned (SLC),TL-00300 - Citation X & Sovereign jack pads,,,,,"$1,597.69",
Non-Certified,Company Owned (SLC),TL-00301 - Cessna 560 Ultra/Encore Thrust Reverser Test Box,,,,,"$3,495.00",
Non-Certified,Company Owned (SLC),TL-00302 - Bearing race and seal driver set,,Autobodynow,ABN9994,,$60.00,
Non-Certified,Company Owned (SLC),TL-00303 - CPU Adapter,,Tronair,K-2453,,"$1,921.64",
Non-Certified,Company Owned (SLC),TL-00304 - Protractor,In Gulfstream tools box,Gulfstream,1159SEM20271-13,,$80.00,
Non-Certified,Company Owned (SLC),TL-00305 - Brake Puck Protectors,Gulfstream tools box,,1159GSEP50117-15,,$300.00,
Non-Certified,Company Owned (SLC),TL-00306 - G3 T/R Sling Mount,In Gulfstream tool box,,,,$50.00,
Non-Certified,Company Owned (SLC),TL-00307 - Pilatus Jack Pads,,,,,"$2,285.19",
Non-Certified,Company Owned (SLC),TL-00308 - Pilatus Bottle Jack Adapters,,,,,"$2,285.19",
Non-Certified,Company Owned (SLC),TL-00309 - PC-12 Brake Bleed Kit,,,,,$30.00,
Non-Certified,Company Owned (SLC),TL-00310 - Resistance Substitution Box,,Irwin,ERS8050,,$95.00,
Non-Certified,Company Owned (SLC),TL-00311 - Mechanic's Stethoscope,,Evercraft,776-9060,,$15.00,
Non-Certified,Company Owned (SLC),TL-00312 - PC-12E Maintenance box,"Generators\nProp feather\nFlaps\nStab trim\nBus tie\nStick pusher\nAir/ground\nCabin heat\nARINC\nother things maybe",Pilatus,MTBX07,137880,"$28,000.00",
Non-Certified,Company Owned (SLC),TL-00313 - PC12/45&47 Cables and Disc,Miscellaneous cables and flap maintenance utility floppy,,,,"$8,000.00",
Non-Certified,Company Owned (SLC),TL-00314 - Handheld Vacuum Test Set,Mityvac automotive test and bleed kit,Mityvac,MV800,,$56.00,
Non-Certified,Company Owned (SLC),TL-00315 - PC-12/45 and 47 Maintenance Test Box,,Emca Electronic Ltd,MTBX94,113245,"$11,000.00",
Non-Certified,Company Owned (SLC),TL-00316 - GIV MLG Single Point Adapter,,Gulfstream,1159SEM20001-1,,"$1,000.00",
Non-Certified,Company Owned (SLC),"TL-00317 - G-150 Nose Gear Jack Adapter\n2 pieces",,Gulfstream,25G9910009-501,,"$6,980.00",
Non-Certified,Company Owned (SLC),TL-00318 - Gulfstream Main Gear Jack Adapter Kit,"""This kit fits every large cabin gulfstream that has ever needed a jack adapter from the first G2 to the last G550 and all models in between""",Alberth aviation,GMGJAK,,"$4,245.75",
Non-Certified,Company Owned (SLC),TL-00319 - G-150 Jack Pads,,,25G9910012-001,,"$3,121.20",
Non-Certified,Company Owned (SLC),TL-00320 - G-150 NLG Trunnion Bolts,,,,,$50.00,
Non-Certified,Company Owned (SLC),TL-00321 - Adjustable Gland Nut Wrench Kit,"OEMTools 27397\nAmerbm",,,,$65.00,
Non-Certified,Company Owned (SLC),TL-00322 - G-550 APU Fire Shut Down Switch,,Keystone,,,$50.00,
Certified,Company Owned (SLC),TL-00323 - Pitostat flight instrument calibrator,,Bill Johnson Instrument,6000-50-R/0,9408,"$1,350.00",
Kit,Company Owned (SLC),TL-00324 - G-200 Jack Pads,"Nose: GSE0720003\nMain: GSE0720004",,,,"$4,317.14",
Non-Certified,Company Owned (SLC),TL-00325 - Falcon 20 Thrust Reverser MX Lockout,,,5475201-1,,$50.00,
Non-Certified,Company Owned (SLC),"TL-00326 - G-450 Static RVSM Tool\nKA-047",,,,,$800.00,
Non-Certified,Company Owned (SLC),TL-00327 - Resistance Substitution Box,,Electrosound,85-1502,1609,$95.00,
Non-Certified,Company Owned (SLC),"TL-00328 - Honeywell HD-710 Maintenance Cable\n",N528AP SAT/COM,Honeywell,,,$75.00,
Non-Certified,Company Owned (SLC),TL-00329 - Grease Zerk Install Kit,,,,,$70.00,
Non-Certified,Company Owned (SLC),TL-00330 - GI-GIV MLG Axle Jack Pads,,Gulfstream,1159SEM20008-2,,"$6,689.90",
Non-Certified,Company Owned (SLC),"TL-00331 - BR700 Right and Left Engine Spinner, Retainer, Filler Bolt Holders\nK005",,Keystone aviation,,,$750.00,
Kit,Company Owned (SLC),TL-00332 - Gulfstream Jack Pads,"1159SEM20008 Quantity: 2\n1159SEM20052-7 NOSE",,,,"$7,334.79",
Kit,Company Owned (SLC),TL-00333 - G550 Jack Pads,"1159GSE50278-4 Right\n1159GSE50278-3 Left\n1159SEM20052-7 Nose",,,,"$9,149.31",
Non-Certified,Company Owned (SLC),TL-00334 - BR710 Fuel/Oil Pipe Wrenches,,Alberth,WFP,,"$1,150.00",
Non-Certified,Company Owned (SLC),TL-00335 - Gulfstream Nose Gear Bushing Press Kit,,,,,$300.00,
Non-Certified,Company Owned (SLC),TL-00336 - Gulfstream Main Wheel Socket Kit,,Alberth Aviation,GS5,037,$0.00,
Non-Certified,Company Owned (SLC),"TL-00337 - 1/4""-1"" Gasket Punch Set",,Westward,2AJL1,,$75.00,
Non-Certified,Company Owned (SLC),TL-00338 - Crew Oxygen Flow Tester,,,,,$100.00,
Non-Certified,Company Owned (SLC),TL-00339 - Gulfstream Passenger Oxygen Flow Test Kit,,,,,$100.00,
Non-Certified,Company Owned (SLC),TL-00340 - Gulfstream NLG Door Retainer,,Gulfstream,1159SEM20048-1,,"$11,913.10",
Non-Certified,Company Owned (SLC),"TL-00341 - G150 & G200 LDG Actuator Extension Covers\n2 pieces",,,,,$150.00,
Non-Certified,Company Owned (SLC),"TL-00342 - G550 Elevator Hardover Protection Tool\nK020",,,,,$868.27,
Non-Certified,Company Owned (SLC),TL-00343 - G550 Axle Jack Adapter,,International Aero Engineering,1159GSE50214-3,9011,"$2,500.00",
Non-Certified,Company Owned (SLC),TL-00344 - G150 Flap/Slat Simulator Test Box,"Astra 1125, SP, SPx\nGulfstream G100, G150\nWaiting for quote",,1125-27-50,024C,$0.00,
Non-Certified,Company Owned (SLC),TL-00345 - GLEX Aileron Leak Check Cable,,Bombardier,G700-271105-1,230279-15,"$1,654.59",
Non-Certified,Company Owned (SLC),TL-00346 - TFE731 ECTM Download Kit,,Honeywell,831702-22,13580-12,"$7,707.00",
Non-Certified,Company Owned (SLC),TL-00347 - Challenger Jack Pads,,Bombardier,G600-070001-1,,"$1,048.95",
Non-Certified,Company Owned (SLC),TL-00348 - Alcon Connector Wear Tool,,,BS1078M,,"$5,424.00",
Non-Certified,Company Owned (SLC),"TL-00349 - 3/4"" Drive Impact Sockets","13/16"" Square \n15/16""-1 1/2"" 6 point",Pittsburgh Pro,67935,,$60.00,
Non-Certified,Company Owned (SLC),"TL-00350 - 1"" Drive Socket Set 1-5/8"" - 3-1/8"" ","12 Point\n2 Extensions\nBreaker Bars\nSome sizes and the ratchet are on Pegboard 1",,,,$279.99,
Non-Certified,Company Owned (SLC),TL-00351 - WOW Targets,6 pieces ,Bombardier,G604-326102-25,,$786.00,
Non-Certified,Company Owned (SLC),TL-00352 - WOW Targets,6 pieces,Bombardier,G604-326101-1,,"$1,985.52",
Non-Certified,Company Owned (SLC),TL-00353 - Bombardier Bombardier WOW Targets,6 WOW Targets,Bombardier,G604-326102-25,,$786.00,
Non-Certified,Company Owned (SLC),TL-00354 - AOA Cover,,Avionics Specialties,123-1515,,$288.71,
Non-Certified,Company Owned (SLC),TL-00355 - Bombardier WOW Targets,6 WOW Targets,Bombardier,G604-326101-1,,"$1,985.52",
Non-Certified,Company Owned (SLC),TL-00356 - Camshaft Pulley / Fan Clutch Set,,Astro,,,$80.00,
Non-Certified,Company Owned (SLC),TL-00357 - Tachometer,,ES,332,13011793,$100.00,
Non-Certified,Company Owned (SLC),TL-00358 - Gauge-Dial 0-300 PSI (Air Filled),,Wika,VA13165,,$59.49,
Non-Certified,Company Owned (SLC),TL-00359 - Gauge-Dial 0-30 PSI (Air Filled),,WIKA,,37603,$56.73,
Non-Certified,Company Owned (SLC),TL-00360 - HondaJet Trim Actuator Breakout Box,,Hondajet,HJT2700-000-1FTT-CS,6,"$29,571.40",
Non-Certified,Company Owned (SLC),TL-00361 - Honda Jet elevator trim tab rig tool,"HJT 5520-030-3RT-CS\nHJT 5520-030-4RT-CS",Hondajet,HJT5520-030-4RT,7,"$30,509.46",
Non-Certified,Company Owned (SLC),TL-00362 - Potable water hose adapter,,,,,$30.00,
Non-Certified,Company Owned (SLC),TL-00363 - Honda jet pressurization tube,,Tronair,K-4446,,"$3,742.97",
Non-Certified,Company Owned (SLC),TL-00364 - DPHM cable kit,,Kell-strom ,PWC44020,1121016,"$2,427.57",
Non-Certified,Company Owned (SLC),"TL-00365 - 6 PCS hollow punch set 3/16""-1/2""",,Westward,,,$46.99,
Non-Certified,Company Owned (SLC),TL-00366 - Unused grease gun,,LUMAX,LX-1152,,$35.00,
Non-Certified,Company Owned (SLC),TL-00367 - Unused grease gun,,Lincoln,1134,,$65.00,
Non-Certified,Company Owned (SLC),TL-00368 - Honda jet jack pad kit,,Hondajet,HJT5000-000-1SP-CS,7,"$6,764.23",
Non-Certified,Company Owned (SLC),TL-00369 - Hondajet anti-skid test,,Hondajet,HJT3200-000-1FTT-CS,3,"$29,935.84",
Non-Certified,Company Owned (SLC),TL-00370 - Hondajet test fixture flap actuator,,Hondajet,HJT2750-810-1CF-CS,10,"$25,807.77",
Non-Certified,Company Owned (SLC),TL-00371 - Hondajet flap contour board,,Hondajet,HJT5753-110-9-10RT-CS,2,"$53,406.54",
Non-Certified,,TL-00372 - PT6 AGB Coupling Gauge,Waiting for quote,Kell-Strom,PWC34061,,$0.00,
Non-Certified,Company Owned (SLC),TL-00373 - Hondajet blacklash tool,,Hondajet,HJT0000-000-1FTT-CS,3,"$30,599.37",
Non-Certified,Company Owned (SLC),TL-00374 - Hondajet Control surface balance kit,,Hondajet,HJT0000-000-1-2BE-CS,2,"$41,634.32",
Non-Certified,Company Owned (SLC),TL-00375 - HF120 engine tooling kit,,Kell-strom,2C82122G01,0215009,$0.00,
Non-Certified,Company Owned (SLC),TL-00376 - Pilatus tooling,,,,,$200.00,
Non-Certified,Company Owned (SLC),TL-00377 - Hondajet probe align tool,,Hondajet,HJT3411-000-1-2CF-CS,4,"$12,159.43",
Certified,Company Owned (SLC),TL-00378 - T/R deploy block kit,,,08ND78430-3,3326-16,"$8,775.00",
Non-Certified,,TL-00379 - Engine Sling,,Keystone,,,$200.00,
Non-Certified,Company Owned (SLC),TL-00380 - BRUTUS screw extractor,,Brutus,5120-01-398-2869,15020,$385.00,
Non-Certified,Company Owned (SLC),TL-00381 - Fuel sample unit,,Tronair,07-3018-6900,6746160204,$743.22,
Non-Certified,Company Owned (SLC),TL-00382 - Hex bit set,,Snap-on,SSDM10A,,$37.19,
Non-Certified,Company Owned (SLC),TL-00383 - Fuel sample unit,,Tronair,07-3026-6900,7357200311,"$1,377.12",
Non-Certified,Company Owned (SLC),TL-00384 - Fuel sample unit,,Tronair,07-3018-6900,6746160205,$743.22,
Non-Certified,Company Owned (SLC),TL-00385 - Fuel sample unit,,Tronair,07-3006-6900,2241061004,$655.95,
Non-Certified,Company Owned (SLC),TL-00386 - Hondajet VG template,,Hondajet,HJT5728-100-7LT-CS,11,"$7,768.22",
Non-Certified,Company Owned (SLC),TL-00387 - Hondajet LDG actuator locks,3 pieces,Hondajet,HJT3200-000-1SE-CS-108,,"$15,665.32",
Non-Certified,Company Owned (SLC),TL-00388 - Hondajet speedbrake act. lock,,Hondajet,HJT2761-000-1ST-CS,7,"$10,519.47",
Non-Certified,Company Owned (SLC),TL-00389 - Hondajet Hyd fitting kit,,,,,$250.00,
Non-Certified,Company Owned (SLC),TL-00390 - Hondajet WOW adapters,,Hondajet,HJT3200-101-1-2FTT-CS,004,"$9,353.64",
Non-Certified,Company Owned (SLC),TL-00391 - In-line Flushing Adapter,,Enviro,1134100-504,,$65.00,
Non-Certified,Company Owned (SLC),TL-00392 - Hondajet oxygen mask drop adapter,,,,,$60.00,
Non-Certified,Company Owned (SLC),TL-00393 - Flushing adapter kit,,Enviro,K1134100-500,,$0.00,
Non-Certified,Company Owned (SLC),TL-00394 - Hondajet flight control rig pin kit,"Aileron rig boards\nRudder rig boards\nattaching hardware",Hondajet,HJT5750-100-1RT-CS,,"$12,413.57",
Non-Certified,Company Owned (SLC),TL-00395 - Hondajet ECS diagnostic kit,,Enviro,TE1300420-640,11,"$6,230.76",
Non-Certified,Company Owned (SLC),TL-00396 - Hondajet flush kit,,,,,$150.00,
Non-Certified,Company Owned (SLC),TL-00397 - Epoxy gun,,3M,DMA 50,,$20.00,
Non-Certified,Company Owned (SLC),TL-00398 - Sealant gun,,,3237814,,$136.80,
Non-Certified,Company Owned (SLC),TL-00399 - Sealant gun,,Semco,850,EN60292,$223.04,
Non-Certified,Company Owned (SLC),TL-00400 - Sealant gun,,,R0031679,,$136.00,
Non-Certified,Company Owned (SLC),TL-00401 - Sealant gun,,,3237814,,$136.00,
Non-Certified,Company Owned (SLC),"TL-00402 - 42"" Bolt cutter",,Crescent,0590MC,,$345.00,
Kit,,TL-00403 - Brake Bleed Kit,,,,,$500.00,
Certified,Company Owned (SLC),TL-00404 - Gauge-Dial 0-3000 PSI (Air Filled),,MH,,,$60.48,
Non-Certified,Company Owned (SLC),TL-00405 - The Claw,Pallet puller,,,,$133.99,
Kit,,TL-00406 - Strut Servicing kit,,,,,$100.00,
Non-Certified,Company Owned (SLC),TL-00407 - Torque Adaptor,Prop nut wrench 5/8,,AST-2877,,$219.95,
Non-Certified,Company Owned (SLC),TL-00408 - Torque Adaptor,Prop nut wrench 7/8,Keystone,,,$250.00,
Non-Certified,Company Owned (SLC),TL-00409 - Torque Adaptor,3/4”,Keystone,,,$250.00,
Non-Certified,Company Owned (SLC),TL-00410 - Crowfoot,2 3/8”,,,,$150.18,
Non-Certified,,TL-00411 - Flare Nut Crowfoot,1 5/8”,Proto,5352FL,,$85.94,
Non-Certified,,TL-00412 - Flare Nut Crowfoot,1 7/8” custom,Keystone,,,$85.00,
Non-Certified,Company Owned (SLC),TL-00413 - Fuel Tank Pressure Test Kit,,Keystone,,,$0.00,
Non-Certified,Company Owned (SLC),TL-00414 - Safe Flite Flap Position Test Harness,K-035,Keystone,,,$0.00,
Non-Certified,Company Owned (SLC),TL-00415 - Meridian Nose Spring Tool,,Keystone,,,$100.00,
Non-Certified,,TL-00416 - Spey LP Shaft Governor Reset Tool,GIII,,GU21447/1,,"$2,995.00",
Kit,Company Owned (SLC),TL-00417 - Battery Power Adaptors,,,,,"$1,530.70",
Non-Certified,,TL-00418 - Gulfstream Axel Jack Adapter,Gulfstream G100-150 Jack Adapter,,,,"$4,250.00",
GSE,Company Owned (SLC),"TL-00419 - 20,000 LBS Tripod Jack",,Tronair ,02-1032C0111,3314190902,"$5,447.00",
GSE,Company Owned (SLC),"TL-00420 - 20,000 LBS Tripod Jack",,Tronair,02-1032-0111,AA14820404,"$5,447.00",
GSE,Company Owned (SLC),"TL-00421 - 20,000 LBS Tripod Jack",,Tronair ,02-1032C0111,3314190901,"$5,447.00",
GSE,Company Owned (SLC),"TL-00422 - 60,000 LBS Tripod Jack",,Tronair ,02A7844-0110,1763050005,"$10,964.00",
GSE,Company Owned (SLC),"TL-00423 - 60,000 LBS Tripod Jack",,Tronair,027844-0100,1648249902,"$10,964.00",
GSE,Company Owned (SLC),"TL-00424 - 50,000 LBS Tripod Jack",,Tronair,02-2546-0100-01,8904-????,"$9,211.00",
GSE,Company Owned (SLC),"TL-00425 - 50,000 LBS Tripod Jack",,Tronair,02-2546-0100--01,8708-8119,"$9,211.00",
GSE,Company Owned (SLC),"TL-00426 - 24,000 LBS Tripod Jack",,Tronair,02-1240-0111,0872140102,"$6,367.00",
GSE,Company Owned (SLC),"TL-00427 - 24,000 LBS Tripod Jack",,Tronair,02-78025-0111,4250070901,"$4,309.00",
GSE,Company Owned (SLC),"TL-00428 - 24,000 LBS Tripod Jack",,Tronair,02-1248-0100-01,8908-15665,"$7,559.00",
GSE,Company Owned (SLC),"TL-00429 - 24,000 LBS Tripod Jack",,Tronair,02-1240-0111,5967140501,"$6,367.00",
GSE,Company Owned (SLC),"TL-00430 - 24,000 LBS Tripod Jack",,Tronair,02-1240-0111,872140101,"$6,367.00",
GSE,Company Owned (SLC),"TL-00431 - 24,000 LBS Tripod Jack",,Tronair,02-7805-0111,4250070902,"$4,309.00",
GSE,Company Owned (SLC),"TL-00432 - 20,000 LBS Tripod Jack",,Tronair,02-1036-0100,1232329103,"$6,263.00",
GSE,Company Owned (SLC),"TL-00433 - 20,000 LBS Tripod Jack",,Tronair,02-1032-0111,AA14830404,"$5,447.00",
GSE,Company Owned (SLC),"TL-00434 - 20,000 LBS Tripod Jack",,Tronair,02-1036-0100,1232289103,"$6,263.00",
GSE,Company Owned (SLC),"TL-00435 - 10,000 LBS Tripod Jack",,Tronair,02-0526-0100,8505-0906,"$5,759.00",
GSE,Company Owned (SLC),"TL-00436 - 10,000 LBS Tripod Jack",,Tronair,02-0522C0141,2672190702,"$5,035.00",
GSE,Company Owned (SLC),"TL-00437 - 10,000 LBS Tripod Jack",,Tronair,02-0526-0100,J-5780,"$5,759.00",
GSE,Company Owned (SLC),"TL-00438 - 10,000 LBS Tripod Jack",,Tronair,02-0527C0140,9456160305,"$6,530.00",
GSE,Company Owned (SLC),"TL-00439 - 10,000 LBS Tripod Jack",,Tronair,02-0526-0110,4230060409,"$5,557.00",
GSE,Company Owned (SLC),"TL-00440 - 10,000 LBS Tripod Jack",,Tronair,02-7828-0110,4165041102,"$6,599.00",
GSE,Company Owned (SLC),"TL-00441 - 10,000 LBS Tripod Jack",,Tronair,02-0526-0110,1254060308,"$4,302.00",
GSE,Company Owned (SLC),"TL-00442 - 10,000 LBS Tripod Jack",,Tronair,02-0544-0110,1683050409,"$5,557.00",
GSE,Company Owned (SLC),"TL-00443 - 10,000 LBS Tripod Jack",,Tronair,02-0544C0110,41692110901,"$5,557.00",
GSE,Company Owned (SLC),"TL-00444 - 10,000 LBS Tripod Jack",,Tronair,02-0526-01110,4494050912,"$4,302.00",
GSE,Company Owned (SLC),"TL-00445 - 10,000 LBS Tripod Jack",,Tronair,02-7828C0110,7143191001,"$6,599.00",
GSE,Company Owned (SLC),"TL-00446 - 10,000 LBS Tripod Jack",,Tronair,02-0526-0110,1294050813,"$4,302.00",
GSE,Company Owned (SLC),"TL-00447 - 10,000 LBS Tripod Jack",,Tronair,02-0526-0100,J-3975,"$5,759.00",
GSE,Company Owned (SLC),"TL-00448 - 10,000 LBS Tripod Jack",,Tronair,02-0526-0100,8503-0454,"$5,759.00",
GSE,Company Owned (SLC),TL-00449 - Battery Hoist,,Tronair,04-6028-0121,1160190101,"$7,974.00",
GSE,Company Owned (SLC),TL-00450 - Battery Hoist,,Tronair,04-6014-0010,0953160101,"$4,174.00",
GSE,Company Owned (SLC),"TL-00451 - 6,000 LBS Tripod Jack",,Meyer,A634,6398,"$1,381.00",
GSE,Company Owned (SLC),TL-00452 - GPU A/C (Orange),,Aero Specialties,PV 90-3GPU,AS90-111,"$8,500.00",
GSE,Company Owned (SLC),TL-00453 - GPU-600,Hobart GPU-600 (White),Hobart,6T28-600CL,399PS03853,"$3,550.00",
Non-Certified,Company Owned (SLC),TL-00454 - Hondajet Engine installation clamp,,Hondajet,HJT7100-000-1-2IT-CS,7,"$17,352.63",
GSE,Company Owned (SLC),TL-00455 - Hydraulic Mule (Tronair),Tan Hydraulic Mule,Tronair,"05-7022-3300,6,7,8,9",8905-14753,"$40,000.00",
GSE,Company Owned (SLC),TL-00456 - Tail Stand,,Tronair,03-4007-0000,2186051102,"$1,743.46",
GSE,Company Owned (SLC),TL-00457 - Tail Stand,,Tronair,03-5800-0010,1405449505,"$3,635.91",
GSE,Company Owned (SLC),TL-00458 - Tail Stand,,Tronair,03-5809-0000,1433109511,"$1,802.90",
GSE,Company Owned (SLC),TL-00459 - Tail Stand,,Tronair,03-4007-0000,8810-12171,"$1,743.46",
GSE,Company Owned (SLC),TL-00460 - Tail Stand,,Tronair,03-4007-0000,90910507505,"$1,743.46",
GSE,Company Owned (SLC),TL-00461 - Nitrogen Cart,,Tronair,12-3103-6011,AA14180203,$985.85,
GSE,Company Owned (SLC),TL-00462 - Nitrogen Cart,,Tronair,12-3103-6011,AA14190203,$985.85,
GSE,Company Owned (SLC),TL-00463 - Oxygen Cart,Green,Anthony,6114,,$546.90,
GSE,Company Owned (SLC),TL-00464 - Floor Jack,,Tronair,02-7830-0100,1637129812,"$6,174.04",
GSE,Company Owned (SLC),TL-00465 - Alco-Lite Platform Ladder ,P/N: 2126171-2040977,Alco-Lite,,140066,"$1,050.00",
GSE,Company Owned (SLC),TL-00466 - Alco-Lite Platform Ladder ,P/N: 2126171-2040977,Alco-Lite ,,174019,$780.00,
GSE,Company Owned (SLC),TL-00467 - Harris 8700 Regulator ,,Harris ,8700,,$800.00,
GSE,Company Owned (SLC),TL-00468 - Wesco Dolly,,Wesco,,,$150.00,
GSE,Company Owned (SLC),TL-00469 - Werner 4 ft. H Fiberglass Step Ladder,,Werner,,,$90.00,
GSE,Company Owned (SLC),TL-00470 - Werner 4 ft. H Fiberglass Step Ladder,,Werner,,,$90.00,
GSE,Company Owned (SLC),TL-00471 - Werner 6 ft. H Fiberglass Step Ladder,,Werner ,,,$110.00,
GSE,Company Owned (SLC),TL-00472 - Werner 8 ft. H Fiberglass Step Ladder ,P/N: 114853-06,Werner ,FS108,,$197.51,
GSE,Company Owned (SLC),TL-00473 - Werner 9 ft. H Fiberglass Step Ladder ,P/N: 57087-13,Werner ,PT6008-4C,,$300.00,
GSE,Company Owned (SLC),TL-00474 - Giant Little Safe Step,,Little Giant ,10310BA,,$240.00,
GSE,Company Owned (SLC),TL-00475 - Two Step Stool,,,L-2311-02,,$80.00,
GSE,Company Owned (SLC),"TL-00476 - 27"" Step Stool",P/N: 421G-27,Keller,327,,$80.00,
GSE,Company Owned (SLC),TL-00477 - Husky Step Stool,,Husky,,,$60.00,
GSE,Company Owned (SLC),TL-00478 - Step Stool,,,,,$64.94,
GSE,Company Owned (SLC),TL-00479 - Step Stool,,,,,$64.94,
GSE,Company Owned (SLC),TL-00480 - Lock-N-Climb 6ft Ladder,,Lock-N-Climb,6LNCPYLON,,"$2,080.00",
GSE,Company Owned (SLC),TL-00481 - Lock-N-Climb 12ft Ladder,,Lock-N-Climb,12LNCPYLON,,"$2,600.00",
GSE,Company Owned (SLC),TL-00482 - 5ft A frame Ladder ,,,,,"$1,050.00",
GSE,Company Owned (SLC),TL-00483 - Werner Fiberglass Step Ladder - 4',P/N:53512-10,Werner,T7404,,$145.00,
GSE,Company Owned (SLC),TL-00484 - Werner Fiberglass Step Ladder - 6',P/N: 100515-544,Werner,NXT1A06,,$170.00,
GSE,Company Owned (SLC),TL-00485 - Werner Fiberglass Step Ladder - 6',,Werner,,,$170.00,
GSE,Company Owned (SLC),TL-00486 - Keller Fiberglass Step Ladder - 6',,Keller,976,,$170.00,
GSE,Company Owned (SLC),TL-00487 - Werner Fiberglass Step Ladder - 6',,Werner,,,$170.00,
GSE,Company Owned (SLC),TL-00488 - Werner Fiberglass Step Ladder - 6',P/N: 100516-440,Werner,FIAA06,,$170.00,
GSE,Company Owned (SLC),TL-00489 - Werner Fiberglass Step Ladder - 4',,Werner,,,$145.00,
GSE,Company Owned (SLC),TL-00490 - Gray Parts Cabinet,,,,,$350.00,
GSE,Company Owned (SLC),TL-00491 - Graymills Clean-o-matic,,Graymills,30041,Y-76,"$4,000.00",
GSE,Company Owned (SLC),TL-00492 - Aerostand Maintenance Stand ,P/N: 18500,McDermott Assoc. Inc.,,1375,"$3,000.00",
GSE,Company Owned (SLC),TL-00493 - 17 Ton Floor Jack,,Regent Jack Mfg. Co.,2928,0152,"$6,000.00",
GSE,Company Owned (SLC),TL-00494 - 3O Ton Floor Jack,,,,,"$6,500.00",
GSE,Company Owned (SLC),TL-00495 - 15 Ton Floor Jack,P/N: CJ67D0250-1,Columbus Jack Co.,,8136,"$5,000.00",
GSE,Company Owned (SLC),TL-00496 - 12 Ton Floor Jack,,,,,"$3,000.00",
GSE,Company Owned (SLC),TL-00497 - 12 Ton Floor Jack,,,,,"$3,000.00",
GSE,Company Owned (SLC),TL-00498 - Enterpac Floor Jack,,Enterpac,02-7924C0100,6974160701,"$2,000.00",
GSE,Company Owned (SLC),TL-00499 - 7 Ton Floor Jack,,Mingay's,ME7-4925,053,"$2,500.00",
Non-Certified,Company Owned (SLC),TL-00500 - Piaggio P-180 Jack Pads,,Keystone,JP-PIA-01-S,,$405.84,
GSE,Company Owned (SLC),TL-00501 - Werner Fiberglass Step Ladder - 4',,Werner,,,$170.00,
GSE,Company Owned (SLC),TL-00502 - Lakewood Drum Fan,P/N:175379,Lakewood,LUF3602A-BM,,$344.00,
GSE,Company Owned (SLC),TL-00503 - Hobart GPU 400,,Hobart,6T28-400CL,398PS03287,"$8,000.00",
GSE,Company Owned (SLC),TL-00504 - Steel Work Bench 9 ft,,,,,"$1,600.00",
GSE,Company Owned (SLC),TL-00505 - Steel Work Bench 6 ft,,,,,"$1,200.00",
GSE,Company Owned (SLC),TL-00506 - Kendall Ultrasonic Cleaner,,Kendall,SI-1990QTD,,"$1,000.00",
GSE,Company Owned (SLC),TL-00507 - IT-30 Inland Edge Tech Parts Wash Station,,Inland Technology,IT1630/I.A,10343110,"$2,500.00",
GSE,Company Owned (SLC),TL-00508 - Alberth Aviation Tire Cage,,Alberth Aviation,TC36,04167,"$12,700.00",
GSE,Company Owned (SLC),TL-00509 - Craftsman Creeper Stool,,Craftsman,,,$50.00,
GSE,Company Owned (SLC),TL-00510 - Tronair Fuel Transfer Cart,,TronAir,07-3000-1921,6646060801,"$8,000.00",
GSE,Company Owned (SLC),TL-00511 - Werner Fiberglass Step Ladder - 6',,Werner,,,$170.00,
GSE,Company Owned (SLC),TL-00512 - Hydraulic Floor Fluid Dispenser ,,Tronair,06-4005-0511,2072070102,$880.00,
GSE,Company Owned (SLC),TL-00513 - Hydraulic Floor Fluid Dispenser ,,,,,$880.00,
GSE,Company Owned (SLC),TL-00514 - Hydraulic Floor Fluid Dispenser ,,Tronair,,,$880.00,
GSE,Company Owned (SLC),TL-00515 - Hydraulic Floor Fluid Dispenser,,Tronair,,,$880.00,
GSE,Company Owned (SLC),TL-00516 - Hydraulic Fluid Dispenser ,,Tronair,53685,238,"$1,000.00",
GSE,Company Owned (SLC),TL-00517 - Hydraulic Fluid Dispenser ,,Malbar,,,"$1,000.00",
GSE,Company Owned (SLC),TL-00518 - Hydraulic Fluid Dispenser ,,Malbar,54115-6PWS,1735,"$1,000.00",
GSE,Company Owned (SLC),TL-00519 - Speed Scrub,,Nobles,,,"$8,000.00",
GSE,Company Owned (SLC),TL-00520 - Flammable Liquid Storage Cabinet ,40 Gal Capacity,Justrite,,,"$2,000.00",
GSE,Company Owned (SLC),TL-00521 - Flammable Liquid Storage Cabinet ,120 Gal Capacity ,Eagle Manufacturing Co.,YPI-62,,"$3,500.00",
GSE,Company Owned (SLC),TL-00522 - Flammable Liquid Storage Cabinet,46 Gal Capacity,Justrite ,,,"$2,500.00",
GSE,Company Owned (SLC),TL-00523 - Genie Floor Lift ,,Genie,GS-2632,GS3204-52529,"$6,500.00",
Non-Certified,,TL-00524 - Hawker Torque Spanners,"2 x WB-808-10UNF\n1 x WB-808-6UNC\n1 x WB-808-1146 \n1 x WB-808-1246",,,,"$1,000.00",
Non-Certified,Company Owned (SLC),TL-00525 - Learjet Jack Pads,"This time with tie-downs\nMay be for Lear 55",,4507100102-003,,"$3,000.00",
Non-Certified,Company Owned (SLC),TL-00526 - Hawker Ignitor Spanner,,Hawker,PE2617,,$300.00,
Kit,,TL-00527 - Structures tool box,,,,,"$6,500.00",
Non-Certified,,TL-00528 - Hot bonder kit,3 black pelican cases,Briskheat,ACR-3-SZBASE,235389,"$9,937.36",
GSE,Company Owned (SLC),TL-00529 - Proformer Break,,Proformer,,,"$2,500.00",
GSE,Company Owned (SLC),"TL-00530 - Dayton Bandsaw 14""",,Dayton,4TJ91,200503,"$2,500.00",
GSE,Company Owned (SLC),"TL-00531 - Dayton Drill Press 16""",,Dayton,4CY86,,"$2,000.00",
GSE,Company Owned (SLC),TL-00532 - Delta Industries Belt Sander,,Delta Industries,31-300,012638,"$1,000.00",
GSE,Company Owned (SLC),TL-00533 - Delta Shopmaster Sander,,Delta,,035221W5021,$271.00,
GSE,Company Owned (SLC),TL-00534 - Baileigh Industrial Brake,,Baileigh,SF-5216E,U57560367,"$4,500.00",
GSE,Company Owned (SLC),TL-00535 - Little Blaster Sand Blaster,,Blast it All,LB4024,LB15001323150,"$2,000.00",
GSE,Company Owned (SLC),TL-00536 - Flammable Liquid Storage Cabinet ,,Eagle Manufactering,1947,,"$2,000.00",
GSE,Company Owned (SLC),TL-00537 - Husky Metal Cabinet,,Husky,111689,D4283280,$500.00,
GSE,Company Owned (SLC),TL-00538 - Husky Metal Cabinet,,Husky,111689,D9923002,$500.00,
GSE,Company Owned (SLC),TL-00539 - Flammable Liquid Storage Cabinet ,,,,,"$1,500.00",
GSE,Company Owned (SLC),TL-00540 - Forklift,,Toyota,7FDU25,61107,"$12,000.00",
Non-Certified,Company Owned (SLC),TL-00541 - Hondajet travel board,,Hondajet,HJT5750-100-2RT-CS,7,"$12,413.57",
Non-Certified,Company Owned (SLC),TL-00542 - Hondajet travel board,,Hondajet,HJT5750-100-1RT-CS,7,"$12,413.57",
GSE,Company Owned (SLC),TL-00543 - Dayton 36' Slip Roll,,Dayton,4YG40A,,"$1,200.00",
Non-Certified,Company Owned (SLC),TL-00544 - Hondajet travel board,,Hondajet,HJT5540-000-1RT-CS,7,"$35,607.36",
Non-Certified,Company Owned (SLC),TL-00545 - Hondajet travel board,,Hondajet,HJT2701-210-1RT-CS,8,"$16,393.59",
Non-Certified,Company Owned (SLC),TL-00546 - Hondajet travel board,,Hondajet,HJT5520-010-3RT-CS,,"$30,269.70",
Non-Certified,Company Owned (SLC),TL-00547 - Hondajet travel board,,Hondajet,HJT5520-010-4RT-CS,,"$30,269.70",
Non-Certified,,TL-00548 - Pneumatic Rivet Squeezer,Size: PRSA9,Thor,5313,672022,"$425.00",
Non-Certified,Company Owned (SLC),TL-00549 - Forklift hoist,,,,,"$400.00",
GSE,Company Owned (SLC),TL-00550 - Digital DC Fuel Quantity Test Set,,Barfield,DC400A,964,"$5,000.00",
GSE,Company Owned (SLC),TL-00551 - Metric Thread Setter Kit,,Grainger,5JK73,,"$150.00",
Non-Certified,,TL-00552 - Tube bender maxi,,Rothenberger,,,"$400.00",
Kit,,TL-00553 - Air Data Accessories Kit,Model CIT-945C,,,,"$6,500.00",
GSE,,TL-00554 - Oxygen booster cart,,,,,"$23,676.75",
GSE,,TL-00555 - Oxygen booster cart,,,,,"$23,676.75",
GSE,,TL-00556 - Nitrogen cart,,,,,"$11,716.27",
GSE,Company Owned (SLC),TL-00557 - Foxcart GPU (yellow),,Foxcart,1600,16554,"$4,062.87",
`;

const parseCSV = (text: string): string[][] => {
    const result: string[][] = [];
    let cell = '';
    let row: string[] = [];
    let inQuote = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];

        if (char === '"') {
            if (inQuote && nextChar === '"') {
                cell += '"';
                i++;
            } else {
                inQuote = !inQuote;
            }
        } else if (char === ',' && !inQuote) {
            row.push(cell);
            cell = '';
        } else if ((char === '\r' || char === '\n') && !inQuote) {
            if (cell || row.length > 0) row.push(cell);
            if (row.length > 0) result.push(row);
            cell = '';
            row = [];
            if (char === '\r' && nextChar === '\n') i++;
        } else {
            cell += char;
        }
    }
    if (cell || row.length > 0) {
        row.push(cell);
        result.push(row);
    }
    return result;
};

export function getSlcTools(): Tool[] {
    const rows = parseCSV(rawCsvData);
    const tools: Tool[] = [];

    // Skip header row (index 0)
    for (let i = 1; i < rows.length; i++) {
        const parts = rows[i];
        if (parts.length < 8) continue;

        // CSV Structure from header:
        // 0: ToolTypeFullName
        // 1: GroupName (Owner)
        // 2: NameDescription (Includes ID sometimes)
        // 3: Details (Description)
        // 4: Make (Manufacturer)
        // 5: Model
        // 6: Serial
        // 7: ToolCost
        // 8: CalibrationDueDays

        const nameDesc = parts[2];
        let toolId = 'Unknown';
        let name = nameDesc;

        // Attempt to extract Tool ID (TL-XXXXX) from NameDescription
        const idMatch = nameDesc.match(/^(TL-\d+)\s*-\s*(.+)$/);
        if (idMatch) {
            toolId = idMatch[1];
            name = idMatch[2];
        } else {
            // Fallback ID generation if pattern doesn't match
            toolId = `SLC-${i.toString().padStart(5, '0')}`;
        }

        const tool: Tool = {
            toolId: toolId,
            name: name.trim(),
            description: parts[3].trim() || name.trim(),
            manufacturer: parts[4].trim() || 'N/A',
            model: parts[5].trim() || 'N/A',
            serialNumber: parts[6].trim() || 'N/A',
            toolCost: parts[7].trim() || '0',
            location: 'SLC',
            owner: parts[1].trim() || 'Company',
            category: parts[0].trim(),
            calibrationStatus: 'N/A',
        };

        const calDays = parseFloat(parts[8]);
        if (!isNaN(calDays)) {
            tool.calibrationDueDays = calDays;
            tool.calibrationStatus = calDays > 0 ? 'Good' : 'Needs Calibration';
        }

        tools.push(tool);
    }
    return tools;
}
