// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Healthcare {

    struct Medicine {
        uint id;
        string IPFS_URL;
        uint price;
        uint quantity;
        uint discount;
        string currentLocation;
        bool active;
    }
    
    struct Doctor {
        uint id;
        string IPFS_URL;  
        address accountAddress;
        uint appointmentCount;
        uint successfulTreatmentCount;
        bool isApproved;
    }

    struct Patient {
        uint id;
        string IPFS_URL; 
        string[] medicalHistory; 
        address accountAddress;
        uint[] boughtMedicines;
    }

    struct Prescription {
        uint id;
        uint medicineId;
        uint patientId;
        uint doctorId;
        uint date;
    }
    
    struct Appointment {
        uint id;
        uint patientId;
        uint doctorId;
        uint date;
        string from;
        string to;
        string appointmentDate;
        string condition;
        string message;
        bool isOpen;
    }

    struct User {
        string name;
        string userType;
        friend[] friendList;
    }

    struct friend{
        address pubkey;
        string name;
    }

    struct message{
        address sender;
        uint256 timestamp;
        string msg;
    }

    struct AllUserStruck{
        string name;
        address accountAddress;
    }

    struct Order {
        uint medicineId;
        uint price;
        uint payAmount;
        uint quantity;
        uint patientId;
        uint date;
    }

    struct Notification {
        uint id;
        address userAddress;
        string message;
        uint timestamp;
        string categoryType;
    }

    // Encrypted Medical Record structures
    struct EncryptedMedicalRecord {
        uint256 id;
        uint256 patientId;
        string ipfsHash;
        string encryptedAESKey;
        string accessPolicy;
        uint256 timestamp;
        address uploadedBy;
        bool isActive;
    }
    
    struct AccessRequest {
        uint256 id;
        uint256 recordId;
        uint256 doctorId;
        uint256 patientId;
        string reason;
        uint256 timestamp;
        bool isPending;
        bool isApproved;
    }

    AllUserStruck[] getAllUsers;

    mapping(address => User) userList;
    mapping(bytes32 => message[]) allMessages;
    
    mapping(address => Notification[]) private notifications;
    mapping(uint => Order[]) public patientOrders;
    mapping(uint => Medicine) public medicines;
    mapping(uint => Doctor) public doctors;
    mapping(uint => Patient) public patients;
    mapping(uint => Prescription) public prescriptions;
    mapping(uint => Appointment) public appointments;
    mapping(address => bool) public registeredDoctors;
    mapping(address => bool) public registeredPatients;
    mapping(address => uint) public doctorAddressToId;
    mapping(address => uint) public patientAddressToId;
    mapping(uint256 => address) public patientIdToAddress;
    mapping(uint256 => address) public doctorIdToAddress;
    
    // Encrypted medical records mappings
    mapping(uint256 => EncryptedMedicalRecord[]) public patientMedicalRecords;
    mapping(uint256 => AccessRequest[]) public patientAccessRequests;
    mapping(uint256 => mapping(uint256 => bool)) public doctorRecordAccess;

    uint public medicineCount;
    uint public doctorCount;
    uint public patientCount;
    uint public prescriptionCount;
    uint public appointmentCount;
    uint256 public accessRequestCounter;

    address payable public admin;
    uint public registrationDoctorFee = 0.0025 ether;
    uint public registrationPatientFee = 0.00025 ether;
    uint public appointmentFee = 0.0025 ether;
  
   //MEDICATION
    event MEDICINE_ADDED(uint id, string url, string location);
    event MEDICINE_LOCATION(uint id, string newLocation);
    event MEDICINE_PRICE(uint id, uint price);
    event MEDICINE_DISCOUNT(uint id, uint discount);
    event MEDICINE_QUANTITY(uint id, uint quantity);
    event MEDICINE_ACTIVE(uint id, bool active);    
    event MEDICINE_BOUGHT(uint patientId, uint medicineId);
    
    //DOCTOR
    event DOCTOR_REGISTERED(uint id, string IPFS_URL, address accountAddress);
    event APPROVE_DOCTOR_STATUSD(uint id, bool isApproved);
    
    //PATIENTS
    event PATIENT_ADDED(uint id, string _IPFS_URL, string[] medicalHistory);
    event NOTIFICATiON_SENT(address indexed user, string message, uint timestamp);
   
    //PRESCRIBED
    event MEDICINE_PRESCRIBED(uint id, uint medicineId, uint patientId, uint doctorId, uint date);
    event APPOINTMENT_BOOKED(uint id, uint patientId, uint doctorId, uint date);
    
    // Encrypted Medical Records Events
    event MedicalRecordUploaded(uint256 indexed patientId, uint256 recordId, string ipfsHash);
    event AccessRequested(uint256 indexed requestId, uint256 doctorId, uint256 patientId, uint256 recordId);
    event AccessGranted(uint256 indexed requestId, uint256 doctorId, uint256 patientId);
    event AccessDenied(uint256 indexed requestId, uint256 doctorId, uint256 patientId);
    event RecordUpdated(uint256 indexed patientId, uint256 recordId, address updatedBy);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyDoctor() {
        require(registeredDoctors[msg.sender], "Only registered doctors can perform this action");
        _;
    }

    constructor() {
        admin = payable(msg.sender);
    }

    //============ ENCRYPTED MEDICAL RECORDS FUNCTIONS ============//
    
    // Upload encrypted medical record
    function uploadEncryptedMedicalRecord(
        uint256 _patientId,
        string memory _ipfsHash,
        string memory _encryptedAESKey,
        string memory _accessPolicy
    ) public returns (uint256) {
        require(bytes(_ipfsHash).length > 0, "IPFS hash required");
        require(bytes(_encryptedAESKey).length > 0, "Encrypted AES key required");
        
        // Verify caller is patient or approved doctor with access
        require(
            patientIdToAddress[_patientId] == msg.sender || 
            (doctors[doctorAddressToId[msg.sender]].isApproved && doctorRecordAccess[_patientId][doctorAddressToId[msg.sender]]),
            "Unauthorized: Only patient or approved doctor can upload"
        );
        
        uint256 recordId = patientMedicalRecords[_patientId].length;
        
        patientMedicalRecords[_patientId].push(EncryptedMedicalRecord({
            id: recordId,
            patientId: _patientId,
            ipfsHash: _ipfsHash,
            encryptedAESKey: _encryptedAESKey,
            accessPolicy: _accessPolicy,
            timestamp: block.timestamp,
            uploadedBy: msg.sender,
            isActive: true
        }));
        
        ADD_NOTIFICATION(patientIdToAddress[_patientId], "New encrypted medical record uploaded", "Medical Record");
        
        emit MedicalRecordUploaded(_patientId, recordId, _ipfsHash);
        return recordId;
    }
    
    // Get patient encrypted records
    function getPatientEncryptedRecords(uint256 _patientId) 
        public 
        view 
        returns (EncryptedMedicalRecord[] memory) 
    {
        return patientMedicalRecords[_patientId];
    }
    
    // Get specific encrypted record
    function getEncryptedRecord(uint256 _patientId, uint256 _recordId)
        public
        view
        returns (EncryptedMedicalRecord memory)
    {
        require(_recordId < patientMedicalRecords[_patientId].length, "Record not found");
        return patientMedicalRecords[_patientId][_recordId];
    }
    
    // Doctor requests access to medical record
    function requestRecordAccess(
        uint256 _patientId,
        uint256 _recordId,
        string memory _reason
    ) public {
        uint256 doctorId = doctorAddressToId[msg.sender];
        require(doctorId > 0, "Not a registered doctor");
        require(doctors[doctorId].isApproved, "Doctor not approved");
        require(_recordId < patientMedicalRecords[_patientId].length, "Record not found");
        
        accessRequestCounter++;
        
        patientAccessRequests[_patientId].push(AccessRequest({
            id: accessRequestCounter,
            recordId: _recordId,
            doctorId: doctorId,
            patientId: _patientId,
            reason: _reason,
            timestamp: block.timestamp,
            isPending: true,
            isApproved: false
        }));
        
        ADD_NOTIFICATION(patientIdToAddress[_patientId], "Doctor requested access to your medical record", "Access Request");
        ADD_NOTIFICATION(msg.sender, "Access request submitted to patient", "Access Request");
        
        emit AccessRequested(accessRequestCounter, doctorId, _patientId, _recordId);
    }
    
    // Patient approves access request
    function approveAccessRequest(uint256 _requestIndex) public {
        uint256 patientId = patientAddressToId[msg.sender];
        require(patientId > 0, "Not a registered patient");
        require(_requestIndex < patientAccessRequests[patientId].length, "Request not found");
        
        AccessRequest storage request = patientAccessRequests[patientId][_requestIndex];
        require(request.isPending, "Request already processed");
        
        request.isPending = false;
        request.isApproved = true;
        
        // Grant doctor access to all patient records
        doctorRecordAccess[patientId][request.doctorId] = true;
        
        ADD_NOTIFICATION(msg.sender, "You approved doctor's access request", "Access Request");
        ADD_NOTIFICATION(doctorIdToAddress[request.doctorId], "Patient approved your access request", "Access Request");
        
        emit AccessGranted(request.id, request.doctorId, patientId);
    }
    
    // Patient denies access request
    function denyAccessRequest(uint256 _requestIndex) public {
        uint256 patientId = patientAddressToId[msg.sender];
        require(patientId > 0, "Not a registered patient");
        require(_requestIndex < patientAccessRequests[patientId].length, "Request not found");
        
        AccessRequest storage request = patientAccessRequests[patientId][_requestIndex];
        require(request.isPending, "Request already processed");
        
        request.isPending = false;
        request.isApproved = false;
        
        ADD_NOTIFICATION(msg.sender, "You denied doctor's access request", "Access Request");
        ADD_NOTIFICATION(doctorIdToAddress[request.doctorId], "Patient denied your access request", "Access Request");
        
        emit AccessDenied(request.id, request.doctorId, patientId);
    }
    
    // Get patient access requests
    function getPatientAccessRequests(uint256 _patientId)
        public
        view
        returns (AccessRequest[] memory)
    {
        return patientAccessRequests[_patientId];
    }
    
    // Check if doctor has access to patient records
    function hasDoctorAccess(uint256 _patientId, uint256 _doctorId)
        public
        view
        returns (bool)
    {
        return doctorRecordAccess[_patientId][_doctorId];
    }
    
    // Patient revokes doctor access
    function revokeAccess(uint256 _doctorId) public {
        uint256 patientId = patientAddressToId[msg.sender];
        require(patientId > 0, "Not a registered patient");
        
        doctorRecordAccess[patientId][_doctorId] = false;
        
        ADD_NOTIFICATION(msg.sender, "You revoked doctor's access to your records", "Access Request");
        ADD_NOTIFICATION(doctorIdToAddress[_doctorId], "Patient revoked your access to their records", "Access Request");
    }
    
    // Update encrypted medical record (for doctors with access)
    function updateEncryptedMedicalRecord(
        uint256 _patientId,
        uint256 _recordId,
        string memory _newIpfsHash,
        string memory _newEncryptedAESKey
    ) public onlyDoctor {
        require(_recordId < patientMedicalRecords[_patientId].length, "Record not found");
        require(doctorRecordAccess[_patientId][doctorAddressToId[msg.sender]], "No access to patient records");
        
        EncryptedMedicalRecord storage record = patientMedicalRecords[_patientId][_recordId];
        record.ipfsHash = _newIpfsHash;
        record.encryptedAESKey = _newEncryptedAESKey;
        record.timestamp = block.timestamp;
        record.uploadedBy = msg.sender;
        
        ADD_NOTIFICATION(patientIdToAddress[_patientId], "Doctor updated your medical record", "Medical Record");
        ADD_NOTIFICATION(msg.sender, "Medical record updated successfully", "Medical Record");
        
        emit RecordUpdated(_patientId, _recordId, msg.sender);
    }
    
    // Deactivate medical record
    function deactivateMedicalRecord(uint256 _patientId, uint256 _recordId) public {
        require(_recordId < patientMedicalRecords[_patientId].length, "Record not found");
        require(
            patientIdToAddress[_patientId] == msg.sender || msg.sender == admin,
            "Only patient or admin can deactivate"
        );
        
        patientMedicalRecords[_patientId][_recordId].isActive = false;
        
        ADD_NOTIFICATION(patientIdToAddress[_patientId], "Medical record deactivated", "Medical Record");
    }

    //============ END OF ENCRYPTED MEDICAL RECORDS ============//

    //NOTIFICATIOn
    function ADD_NOTIFICATION(address _userAddress, string memory _message, string memory _type) internal {
        Notification memory newNotification = Notification({
            id: notifications[_userAddress].length,
            userAddress: _userAddress,
            message: _message,
            timestamp: block.timestamp,
            categoryType: _type
        });

        notifications[_userAddress].push(newNotification);
        emit NOTIFICATiON_SENT(_userAddress, _message, block.timestamp);
    }

    function GET_NOTIFICATIONS(address _userAddress) external view returns (Notification[] memory) {
        return notifications[_userAddress];
    }

    //--------------MEDICINE------------------

    ///ADD MEDICATION
    function ADD_MEDICINE( string memory _IPFS_URL,  uint _price, uint _quantity,uint _discount, string memory _currentLocation) public onlyAdmin {
        medicineCount++;
        medicines[medicineCount] = Medicine(medicineCount, _IPFS_URL, _price, _quantity, _discount, _currentLocation, true);

        ADD_NOTIFICATION(msg.sender, "New Medicine added to marketplace successfully!", "Medicine");

        emit MEDICINE_ADDED(medicineCount, _IPFS_URL, _currentLocation);
    }

    //UPDATE MEDICATION LOCATION
    function UPDATE_MEDICINE_LOCATION(uint _medicineId, string memory _newLocation) public onlyAdmin {
        require(_medicineId <= medicineCount, "Medicine does not exist");
        medicines[_medicineId].currentLocation = _newLocation;

        ADD_NOTIFICATION(msg.sender, "Medicine location updated successfully", "Medicine");

        emit MEDICINE_LOCATION(_medicineId, _newLocation);
    }

    //UPDATE MEDICATION PRICE
    function UPDATE_MEDICINE_PRICE(uint _medicineId, uint _price) public onlyAdmin {
        require(_medicineId <= medicineCount, "Medicine does not exist");
        medicines[_medicineId].price = _price;

         ADD_NOTIFICATION(msg.sender, "Medicine price updated successfully", "Medicine");

        emit MEDICINE_PRICE(_medicineId, _price);
    }

    //UPDATE MEDICATION QUENTITY
    function UPDATE_MEDICINE_QUANTITY(uint _medicineId, uint _quantity) public onlyAdmin {
        require(_medicineId <= medicineCount, "Medicine does not exist");
        medicines[_medicineId].quantity = _quantity;

         ADD_NOTIFICATION(msg.sender, "Medicine quantity updated successfully", "Medicine");

        emit MEDICINE_QUANTITY(_medicineId, _quantity);
    }

    //UPDATE MEDICATION DISCOUNT
    function UPDATE_MEDICINE_DISCOUNT(uint _medicineId, uint _discount) public onlyAdmin {
        require(_medicineId <= medicineCount, "Medicine does not exist");
        medicines[_medicineId].discount = _discount;

         ADD_NOTIFICATION(msg.sender, "Medicine discount updated successfully", "Medicine");

        emit MEDICINE_DISCOUNT(_medicineId, _discount);
    }

    //UPDATE MEDICATION ACTIVE
   function UPDATE_MEDICINE_ACTIVE(uint _medicineId) public onlyAdmin {
        require(_medicineId <= medicineCount, "Medicine does not exist");
        medicines[_medicineId].active = !medicines[_medicineId].active;

         ADD_NOTIFICATION(msg.sender, "Medicine status updated successfully", "Medicine");

        emit MEDICINE_ACTIVE(_medicineId, medicines[_medicineId].active);
   }

    //--------------END OF MEDICINE------------------

    //--------------DOCTOR------------------

    //ADD DOCTOR
    function ADD_DOCTOR(string memory _IPFS_URL, address _address, string calldata _name,  string memory _type) public payable {
        require(msg.value == registrationDoctorFee, "Incorrect registration fee");
        require(!registeredDoctors[_address], "Doctor is already registered");
        
        doctorCount++;
        doctors[doctorCount] = Doctor(doctorCount, _IPFS_URL, _address, 0, 0, false);
        registeredDoctors[_address] = true;
        doctorAddressToId[_address] = doctorCount;
        doctorIdToAddress[doctorCount] = _address;

        payable(admin).transfer(msg.value);

        //REGISTER
        CREATE_ACCOUNT(_name, _address, _type);

         ADD_NOTIFICATION(_address, "You have successfully completed the registration, now waiting for approval", "Doctor");
         ADD_NOTIFICATION(admin, "New doctor is registered, now waiting for approval", "Doctor");

        emit DOCTOR_REGISTERED(doctorCount, _IPFS_URL, _address);
    }

    // APPROVE DOCTOR STATUS
    function APPROVE_DOCTOR_STATUS(uint _doctorId) public onlyAdmin {
        require(_doctorId <= doctorCount, "Doctor does not exist");
        require(!doctors[_doctorId].isApproved, "Doctor is already approved");

        doctors[_doctorId].isApproved = !doctors[_doctorId].isApproved;

        ADD_NOTIFICATION(msg.sender, "You have approved Doctor registration", "Doctor");
        ADD_NOTIFICATION(doctors[_doctorId].accountAddress, "Your registration is approved", "Doctor");

        emit APPROVE_DOCTOR_STATUSD(_doctorId, doctors[_doctorId].isApproved);
    }

    // UPDATE BY DOCTOR
    function UPDATE_PATIENT_MEDICAL_HISTORY(uint _patientId, string memory _newMedicalHistory) public onlyDoctor {
            require(_patientId <= patientCount, "Patient does not exist");
            patients[_patientId].medicalHistory.push(_newMedicalHistory);

            ADD_NOTIFICATION(msg.sender, "You have successfully updated patient medical history", "Doctor");

            ADD_NOTIFICATION(patients[_patientId].accountAddress, "Your medical history updated by doctor", "Doctor");

            ADD_NOTIFICATION(admin, "Patient medical history is updated", "Doctor");
    }

    function COMPLETE_APPOINTMENT(uint _appointmentId) public onlyDoctor {
        require(_appointmentId <= appointmentCount, "Appointment does not exist");
        require(appointments[_appointmentId].doctorId == GET_DOCTOR_ID(msg.sender), "Only the assigned doctor can complete the appointment");

        appointments[_appointmentId].isOpen = false;
        doctors[GET_DOCTOR_ID(msg.sender)].successfulTreatmentCount++;

        ADD_NOTIFICATION(msg.sender, "You have successfully completed the appointment", "Doctor");

        ADD_NOTIFICATION(patients[appointments[_appointmentId].patientId].accountAddress, "Your Appointment is successfully completed", "Doctor");

        ADD_NOTIFICATION(admin, "Doctor completed appointment successfully", "Doctor");
    }

    function PRESCRIBE_MEDICINE(uint _medicineId, uint _patientId) public onlyDoctor {
        require(doctors[GET_DOCTOR_ID(msg.sender)].isApproved, "Doctor is not approved");

        prescriptionCount++;
        prescriptions[prescriptionCount] = Prescription(prescriptionCount, _medicineId, _patientId, GET_DOCTOR_ID(msg.sender), block.timestamp);
        emit MEDICINE_PRESCRIBED(prescriptionCount, _medicineId, _patientId, GET_DOCTOR_ID(msg.sender), block.timestamp);

        ADD_NOTIFICATION(msg.sender, "You have successfully prescribed medicine", "Doctor");

        ADD_NOTIFICATION(patients[_patientId].accountAddress, "Doctor prescribed you medicine", "Doctor");

        ADD_NOTIFICATION(admin, "Doctor prescribed medicine successfully", "Doctor");
    }

    //--------------END OF DOCTOR------------------

    //--------------PATIENT------------------

    //// ADD PATIENTS
    function ADD_PATIENTS(string memory _IPFS_URL, string[] memory _medicalHistory, address _accountAddress, uint[] memory _boughtMedicines, string calldata _name, address _doctorAddress, string calldata _doctorName, string memory _type) public payable {
            require(msg.value == registrationPatientFee, "Incorrect registration fee");
            require(!registeredPatients[_accountAddress], "Patient is already registered");

            patientCount++;
            patients[patientCount] = Patient(patientCount, _IPFS_URL, _medicalHistory, _accountAddress, _boughtMedicines);
            registeredPatients[_accountAddress] = true;
            patientAddressToId[_accountAddress] = patientCount;
            patientIdToAddress[patientCount] = _accountAddress;

            payable(admin).transfer(msg.value);

            //REGISTER
            CREATE_ACCOUNT(_name, _accountAddress, _type);

             //CHAT FRIEND
            ADD_FRIEND(_doctorAddress, _doctorName, _accountAddress);

            ADD_NOTIFICATION(_accountAddress, "You have successfully completed registration", "Patient");

            ADD_NOTIFICATION(admin, "New Patient is registered successfully", "Patient");

            emit PATIENT_ADDED(patientCount, _IPFS_URL, _medicalHistory);
    }

    /// BOOK_APPOINTMENT
    function BOOK_APPOINTMENT(uint _patientId, uint _doctorId, string memory _from,string memory _to,string memory _appointmentDate,string memory _condition, string memory _message, address _doctorAddress, string calldata _name) public payable {
            require(_patientId <= patientCount, "Patient does not exist");
            require(_doctorId <= doctorCount, "Doctor does not exist");
            require(doctors[_doctorId].isApproved, "Doctor is not approved");
            require(patients[_patientId].accountAddress == msg.sender, "Only the patient can book their appointment");
            require(msg.value == appointmentFee, "Incorrect appointment fee");

            uint adminShare = msg.value / 10;
            uint doctorShare = msg.value - adminShare;

            appointmentCount++;
            appointments[appointmentCount] = Appointment(appointmentCount, _patientId, _doctorId, block.timestamp, _from,_to, _appointmentDate, _condition, _message, true);

            doctors[_doctorId].appointmentCount++;
            
            payable(admin).transfer(adminShare);
            payable(doctors[_doctorId].accountAddress).transfer(doctorShare);

            //CHAT FRIEND
            ADD_FRIEND(_doctorAddress, _name, msg.sender);

            ADD_NOTIFICATION(_doctorAddress, "You have a new appointment", "Patient");

            ADD_NOTIFICATION(msg.sender, "You have successfully booked an appointment", "Patient");

            ADD_NOTIFICATION(admin, "New appointment booked", "Patient");

            emit APPOINTMENT_BOOKED(appointmentCount, _patientId, _doctorId, block.timestamp);
    }

    function BUY_MEDICINE(uint _patientId, uint _medicineId, uint _quantity) public payable {
        require(_patientId <= patientCount, "Patient does not exist");
        require(_medicineId <= medicineCount, "Medicine does not exist");
        require(patients[_patientId].accountAddress == msg.sender, "Only the patient can buy their medicine");
        require(medicines[_medicineId].active, "Medicine is not active");
        require(medicines[_medicineId].quantity >= _quantity, "Not enough medicine in stock");

        uint totalPrice = medicines[_medicineId].price * _quantity;

        medicines[_medicineId].quantity -= _quantity;

        patients[_patientId].boughtMedicines.push(_medicineId);

        patientOrders[_patientId].push(Order({
            medicineId: _medicineId,
            price: medicines[_medicineId].price,
            payAmount: totalPrice,
            quantity: _quantity,
            patientId: _patientId,
            date: block.timestamp
        }));

         ADD_NOTIFICATION(msg.sender, "You have successfully bought medicine", "Patient");

        ADD_NOTIFICATION(admin, "Transaction completed, medicine bought successfully", "Patient");

        emit MEDICINE_BOUGHT(_patientId, _medicineId);
    }

    //--------------END OF PATIENT------------------

     //--------------ADMIN------------------

    //UPDATE ONLY ADMIN
    function UPDATE_REGISTRATION_FEE(uint _newFee) public onlyAdmin {
        registrationDoctorFee = _newFee;

         ADD_NOTIFICATION(admin, "You have successfully updated Registration fee", "Admin");
    }

    function UPDATE_APPOINTMENT_FEE(uint _newFee) public onlyAdmin {
        appointmentFee = _newFee;

         ADD_NOTIFICATION(admin, "You have successfully updated Appointment fee", "Admin");
    }

    function UPDATE_REGISTRATION_PATIENT_FEE(uint _newFee) public onlyAdmin {
        registrationPatientFee = _newFee;

         ADD_NOTIFICATION(admin, "You have successfully updated Patient Registration fee", "Admin");
    }

    function UPDATE_ADMIN_ADDRESS(address payable _newAddress) public onlyAdmin {
        admin = _newAddress;

         ADD_NOTIFICATION(admin, "You have successfully updated admin address", "Admin");
    }

    //--------------END OF ADMIN------------------

    
    //--------------GET PATIENT------------------

    function GET_ALL_PATIENT_ORDERS(uint patientId) public view returns (Order[] memory) {
        require(patientId <= patientCount, "Patient does not exist");
        return patientOrders[patientId];
    }

    //GET PRESCRIPTION DETAILS
    function GET_PRESCRIPTION_DETAILS(uint _prescriptionId) public view returns (Prescription memory) {
        return prescriptions[_prescriptionId];
    }

    // GET_ALL_PRESCRIBED_MEDICINES
    
    function GET_ALL_PRESCRIBED_MEDICINES() public view returns (Prescription[] memory) {
        Prescription[] memory allPrescriptions = new Prescription[](prescriptionCount);
        uint counter = 0;
        for (uint i = 1; i <= prescriptionCount; i++) {
            allPrescriptions[counter] = prescriptions[i];
            counter++;
        }
        return allPrescriptions;
    }

    function GET_ALL_PRESCRIBED_MEDICINES_OF_PATIENT(uint patientId) public view returns (Prescription[] memory) {
        uint count = 0;
        for (uint i = 1; i <= prescriptionCount; i++) {
            if (prescriptions[i].patientId == patientId) {
                count++;
            }
        }

        Prescription[] memory patientPrescriptions = new Prescription[](count);
        uint counter = 0;
        for (uint i = 1; i <= prescriptionCount; i++) {
            if (prescriptions[i].patientId == patientId) {
                patientPrescriptions[counter] = prescriptions[i];
                counter++;
            }
        }
        return patientPrescriptions;
    }

    function GET_ALL_REGISTERED_PATIENTS() public view returns (Patient[] memory) {
        Patient[] memory allPatients = new Patient[](patientCount);
        uint counter = 0;
        for (uint i = 1; i <= patientCount; i++) {
            allPatients[counter] = patients[i];
            counter++;
        }
        return allPatients;
    }

    function GET_PATIENT_ID(address _patientAddress) public view returns (uint) {
        uint id = patientAddressToId[_patientAddress];
        require(id > 0, "Patient not found");
        return id;
    }

    function GET_PATIENT_APPOINTMENT(uint _appointmentId) public view returns (Appointment memory) {
        require(_appointmentId <= appointmentCount, "Appointment does not exist");
        require(appointments[_appointmentId].patientId == GET_PATIENT_ID(msg.sender) || msg.sender == admin, "Only the patient or admin can view the appointment");
        return appointments[_appointmentId];
    }

    function GET_PATIENT_MEDICIAL_HISTORY(uint _patientId) public view returns (string[] memory) {
        require(_patientId <= patientCount, "Patient does not exist");
        require(patients[_patientId].accountAddress == msg.sender || msg.sender == admin, "Only the patient or admin can view the medical history");
        return patients[_patientId].medicalHistory;
    }

    function GET_PATIENT_APPOINTMENT_HISTORYS(uint _patientId) public view returns (Appointment[] memory) {
        require(_patientId <= patientCount, "Patient does not exist");

        uint count = 0;
        for (uint i = 1; i <= appointmentCount; i++) {
            if (appointments[i].patientId == _patientId) {
                count++;
            }
        }

        Appointment[] memory patientAppointments = new Appointment[](count);
        uint counter = 0;
        for (uint i = 1; i <= appointmentCount; i++) {
            if (appointments[i].patientId == _patientId) {
                patientAppointments[counter] = appointments[i];
                counter++;
            }
        }
        return patientAppointments;
   }

    function GET_PATIENT_DETAILS(uint _patientId) public view returns (Patient memory) {
        return patients[_patientId];
    }

    function GET_BOUGHT_MEDICINE_BY_PAITENT(uint _patientId) public view returns (uint[] memory) {
        require(_patientId <= patientCount, "Patient does not exist");
        return patients[_patientId].boughtMedicines;
    }

    function GET_ALL_APPOINTMENTS() public view returns (Appointment[] memory) {
        Appointment[] memory allAppointments = new Appointment[](appointmentCount);
        uint counter = 0;
        for (uint i = 1; i <= appointmentCount; i++) {
            allAppointments[counter] = appointments[i];
            counter++;
        }
        return allAppointments;
    }

    //--------------END OF GET PATIENT------------------


    //-------------- GET OF  DOCTOR------------------

    //GET FUNCTION FOR DOCTORS
    function GET_ALL_REGISTERED_DOCTORS() public view returns (Doctor[] memory) {
        Doctor[] memory allDoctors = new Doctor[](doctorCount);
        uint counter = 0;
        for (uint i = 1; i <= doctorCount; i++) {
            allDoctors[counter] = doctors[i];
            counter++;
        }
        return allDoctors;
    }

    function GET_ALL_APPROVED_DOCTORS() public view returns (Doctor[] memory) {
        uint approvedCount = 0;
        for (uint i = 1; i <= doctorCount; i++) {
            if (doctors[i].isApproved) {
                approvedCount++;
            }
        }

        Doctor[] memory approvedDoctors = new Doctor[](approvedCount);
        uint counter = 0;
        for (uint i = 1; i <= doctorCount; i++) {
            if (doctors[i].isApproved) {
                approvedDoctors[counter] = doctors[i];
                counter++;
            }
        }
        return approvedDoctors;
    }

    function GET_MOST_POPULAR_DOCTOR() public view returns (Doctor memory) {
        Doctor memory bestDoctor;
        uint highestScore = 0;
        for (uint i = 1; i <= doctorCount; i++) {
            uint score = doctors[i].appointmentCount + doctors[i].successfulTreatmentCount;
            if (score > highestScore) {
                highestScore = score;
                bestDoctor = doctors[i];
            }
        }
        return bestDoctor;
    }

    function GET_DOCTOR_DETAILS(uint _doctorId) public view returns (Doctor memory) {
        return doctors[_doctorId];
    }

    function GET_DOCTOR_ID(address _doctorAddress) public view returns (uint) {
        uint id = doctorAddressToId[_doctorAddress];
        require(id > 0, "Doctor not found");
        return id;
    }

    function GET_DOCTOR_APPOINTMENTS_HISTORYS(uint _doctorId) public view returns (Appointment[] memory) {
        require(_doctorId <= doctorCount, "Doctor does not exist");

        uint count = 0;
        for (uint i = 1; i <= appointmentCount; i++) {
            if (appointments[i].doctorId == _doctorId) {
                count++;
            }
        }

        Appointment[] memory doctorAppointments = new Appointment[](count);
        uint counter = 0;
        for (uint i = 1; i <= appointmentCount; i++) {
            if (appointments[i].doctorId == _doctorId) {
                doctorAppointments[counter] = appointments[i];
                counter++;
            }
        }
        return doctorAppointments;
    }
    
    // Get doctor's patients
    function GET_DOCTOR_PATIENTS(uint _doctorId) public view returns (Patient[] memory) {
        require(_doctorId <= doctorCount, "Doctor does not exist");
        
        // Count unique patients
        uint[] memory uniquePatientIds = new uint[](patientCount);
        uint uniqueCount = 0;
        
        for (uint i = 1; i <= appointmentCount; i++) {
            if (appointments[i].doctorId == _doctorId) {
                bool isUnique = true;
                for (uint j = 0; j < uniqueCount; j++) {
                    if (uniquePatientIds[j] == appointments[i].patientId) {
                        isUnique = false;
                        break;
                    }
                }
                if (isUnique) {
                    uniquePatientIds[uniqueCount] = appointments[i].patientId;
                    uniqueCount++;
                }
            }
        }
        
        Patient[] memory doctorPatients = new Patient[](uniqueCount);
        for (uint i = 0; i < uniqueCount; i++) {
            doctorPatients[i] = patients[uniquePatientIds[i]];
        }
        
        return doctorPatients;
    }

    //--------------END OF GET DOCTOR------------------


    //-------------- GET MEDICINE------------------

    //GET FUNCTION FOR MEDICATION
    function GET_ALL_REGISTERED_MEDICINES() public view returns (Medicine[] memory) {
        Medicine[] memory allMedicine = new Medicine[](medicineCount);
        uint counter = 0;
        for (uint i = 1; i <= medicineCount; i++) {
            allMedicine[counter] = medicines[i];
            counter++;
        }
        return allMedicine;
    }

    function GET_MEDICINE_DETAILS(uint _medicineId) public view returns (Medicine memory) {
        return medicines[_medicineId];
    }
   
   //--------------END OF GET MEDICINE------------------


   //-------------- CHAT------------------

    //CHECK USER EXIST
    function CHECK_USER_EXISTS(address pubkey) public view returns(bool){
        return bytes(userList[pubkey].name).length > 0;
    }

    //CREATE ACCOUNT
    function CREATE_ACCOUNT(string calldata name, address _address, string memory _type) internal {
        require(CHECK_USER_EXISTS(_address) == false, "User already exists");
        require(bytes(name).length>0, "Username cannot be empty");

        userList[_address].name = name;
        userList[_address].userType = _type;

        getAllUsers.push(AllUserStruck(name, _address));
    }

    //GET USERNAME
    function GET_USERNAME_TYPE(address pubkey) external view returns(User memory){
        require(CHECK_USER_EXISTS(pubkey), "User is not registered");
        return userList[pubkey];
    }


    function ADD_FRIEND(address friend_key, string calldata name, address _myAddress) internal {
        
        require(CHECK_USER_EXISTS(_myAddress), "Create an account first");
        require(CHECK_USER_EXISTS(friend_key), "User is not registered!");
        require(_myAddress != friend_key, "Users cannot add themselves as friends");

    
        if (!CHECK_ALREADY_FRIENDS(_myAddress, friend_key)) {
            _ADD_FRIEND(_myAddress, friend_key, name);
            _ADD_FRIEND(friend_key, _myAddress, userList[_myAddress].name);
        }
    }

    //checkAlreadyFriends
    function CHECK_ALREADY_FRIENDS(address pubkey1, address pubkey2) internal view returns (bool){

        if(userList[pubkey1].friendList.length > userList[pubkey2].friendList.length){
            address tmp = pubkey1;
            pubkey1 = pubkey2;
            pubkey2 = tmp;
        }

        for(uint256 i = 0; i < userList[pubkey1].friendList.length; i++){
            
            if(userList[pubkey1].friendList[i].pubkey == pubkey2) return true;
        }
        return false;
    }

    function _ADD_FRIEND(address me, address friend_key, string memory name) internal{
        friend memory newFriend = friend(friend_key, name);
       userList[me].friendList.push(newFriend);
    }

    //GETMY FRIEND
    function GET_MY_FRIEND_LIST(address _address) external view returns(friend[] memory){
        return userList[_address].friendList;
    }

    //get chat code
    function _GET_CHAT_CODE(address pubkey1, address pubkey2) internal pure returns(bytes32){
        if(pubkey1 < pubkey2){
            return keccak256(abi.encodePacked(pubkey1, pubkey2));
        } else 
        return keccak256(abi.encodePacked(pubkey2, pubkey1));
    }

    //SEND MESSAGE
    function _SEND_MESSAGE(address friend_key, address _myAddress, string calldata _msg) external{
        require(CHECK_USER_EXISTS(_myAddress), "Create an account first");
        require(CHECK_USER_EXISTS(friend_key), "User is not registered");
        require(CHECK_ALREADY_FRIENDS(_myAddress, friend_key), "You are not friend with the given user");

        bytes32 chatCode = _GET_CHAT_CODE(_myAddress, friend_key);
        message memory newMsg = message(_myAddress, block.timestamp, _msg);
        allMessages[chatCode].push(newMsg);

        ADD_NOTIFICATION(_myAddress, "You have successfully sent message", "Message");

        ADD_NOTIFICATION(friend_key, "You have new message", "Message");

        ADD_NOTIFICATION(admin, "Message sent successfully", "Message");
    }

    //READ MESSAGE
    function GET_READ_MESSAGE(address friend_key, address _myAddress) external view returns(message[] memory){
        bytes32 chatCode = _GET_CHAT_CODE(_myAddress, friend_key);
        return allMessages[chatCode];
    }

    function GET_ALL_APP_USER() public view returns(AllUserStruck[] memory){
        return getAllUsers;
    }

     //--------------END OF CHAT------------------
}