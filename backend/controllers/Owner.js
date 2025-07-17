require("dotenv").config();
const { doc, setDoc, getDoc, updateDoc, collection, getDocs, query, where, deleteDoc } = require("firebase/firestore");
const { db } = require("../config/firebase.js");
const { sendAccessCodeSMS } = require("../Utils/SendSMS.js");
const jwt = require("jsonwebtoken");
const { sendVerificationEmail, sendAccessCodeEmail } = require("../Utils/SendEmail.js");
const bcrypt = require("bcrypt");
const { generateAccessToken, generateRefreshToken } = require("../Utils/TokenService.js");

const createNewAccessCode = async (req, res) => {
    try {
        const { identifier } = req.body;

        if (!identifier) {
            return res.status(400).json({ error: "Thiếu thông tin đăng nhập" });
        }

        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
        const isPhone = /^\+?\d{9,15}$/.test(identifier);

        if (!isEmail && !isPhone) {
            return res.status(400).json({ error: "Định dạng không hợp lệ" });
        }

        const accessCode = Math.floor(100000 + Math.random() * 900000).toString();
        const docRef = doc(db, "accessCodes", identifier);
        await setDoc(docRef, { accessCode });

        if (isPhone) {
            const smsSent = await sendAccessCodeSMS(identifier, accessCode);
            if (!smsSent) {
                return res.status(500).json({ error: "Gửi mã xác thực qua SMS thất bại" });
            }
        }

        if (isEmail) {
            const emailSent = await sendAccessCodeEmail(identifier, accessCode);
            if (!emailSent) {
                return res.status(500).json({ error: "Gửi mã xác thực qua Email thất bại" });
            }
        }

        return res.json({
            success: true,
            message: `Mã xác thực đã được gửi qua ${isEmail ? "email" : "SMS"}`,
        });
    } catch (err) {
        console.error("Error creating access code:", err);
        return res.status(500).json({ error: "Lỗi máy chủ" });
    }
};

const validateAccessCode = async (req, res) => {
    try {
        const { phoneNumber, email, accessCode } = req.body;

        if (!accessCode || (!phoneNumber && !email)) {
            return res.status(400).json({ error: "Missing access code or identifier (phone/email)" });
        }

        const identifier = email || phoneNumber;
        const codeDocRef = doc(db, "accessCodes", identifier);
        const snapshot = await getDoc(codeDocRef);

        if (!snapshot.exists()) {
            return res.status(404).json({ error: "Access code not found" });
        }

        const storedCode = snapshot.data()?.accessCode;

        if (storedCode !== accessCode) {
            return res.status(401).json({ success: false, error: "Invalid access code" });
        }

        await updateDoc(codeDocRef, { accessCode: "" });

        let userQuery;
        if (phoneNumber) {
            userQuery = query(
                collection(db, "employees"),
                where("phoneNumber", "==", phoneNumber)
            );
        } else {
            userQuery = query(
                collection(db, "employees"),
                where("email", "==", email)
            );
        }

        const userSnap = await getDocs(userQuery);
        if (userSnap.empty) {
            return res.status(404).json({ error: "User not found" });
        }

        const userDoc = userSnap.docs[0];
        const userData = userDoc.data();

        const payload = {
            id: userDoc.id,
            role: userData.role,
        };

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        await updateDoc(userDoc.ref, {
            refreshToken: refreshToken,
        });

        return res.json({
            success: true,
            accessToken,
            refreshToken,
            user: {
                id: userDoc.id,
                name: userData.name,
                email: userData.email,
                role: userData.role,
                phoneNumber: userData.phoneNumber,
            },
        });
    } catch (err) {
        console.error("Error validating access code:", err);
        return res.status(500).json({ error: "Server error" });
    }
};

const createEmployee = async (req, res) => {
    try {
        const { name, email, role, phoneNumber, address } = req.body;

        if (!name || !email || !role || !phoneNumber) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const collectionRef = collection(db, "employees");
        const emailQuery = query(collectionRef, where("email", "==", email));
        const emailSnapshot = await getDocs(emailQuery);

        if (!emailSnapshot.empty) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const phoneQuery = query(collectionRef, where("phoneNumber", "==", phoneNumber));
        const phoneSnapshot = await getDocs(phoneQuery);

        if (!phoneSnapshot.empty) {
            return res.status(400).json({ message: "Phone number already exists" });
        }

        const newDocRef = doc(collectionRef);
        const employeeId = newDocRef.id;

        const token = jwt.sign({ employeeId, email }, process.env.JWT_SECRET, { expiresIn: "1d" });
        const verificationLink = `${process.env.CLIENT_URL}/verify/${token}`;

        await setDoc(newDocRef, {
            name,
            email,
            role,
            phoneNumber,
            address,
            id: employeeId,
            verified: false,
            status: "Active",
            createdAt: new Date().toISOString(),
        });

        await sendVerificationEmail(email, verificationLink);

        res.status(201).json({ success: true, employeeId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};

const setupEmployeeAccount = async (req, res) => {
    try {
        const { token, username, password } = req.body;

        if (!token || !username || !password) {
            return res.status(400).json({ error: "Missing token, username, or password" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { employeeId } = decoded;

        const docRef = doc(db, "employees", employeeId);
        const userSnap = await getDoc(docRef);

        if (!userSnap.exists()) {
            return res.status(404).json({ error: "Employee not found" });
        }

        const userData = userSnap.data();

        const hashedPassword = await bcrypt.hash(password, 10);

        await updateDoc(docRef, {
            username,
            password: hashedPassword,
            verified: true,
        });

        const payload = {
            id: employeeId,
            role: userData.role,
        };

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        await updateDoc(docRef, {
            refreshToken: refreshToken,
        });

        return res.json({
            success: true,
            accessToken,
            refreshToken,
            user: {
                id: employeeId,
                name: userData.name,
                email: userData.email,
                role: userData.role,
                phoneNumber: userData.phoneNumber,
            },
        });
    } catch (err) {
        console.error("Error setting up account:", err);
        return res.status(500).json({ error: "Invalid or expired token" });
    }
};

const getEmployees = async (req, res) => {
    const { searchText = '' } = req.query;

    try {
        const querySnapshot = await getDocs(collection(db, 'employees'));

        let employees = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        if (searchText.trim() !== '') {
            const lowerText = searchText.toLowerCase();
            employees = employees.filter(emp =>
                (emp.name && emp.name.toLowerCase().includes(lowerText)) ||
                (emp.email && emp.email.toLowerCase().includes(lowerText))
            );
        }

        return res.json({ success: true, employees });
    } catch (error) {
        console.error('Error getting employees:', error);
        return res.status(500).json({ error: "Server error" });
    }
};

const updateEmployee = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const docRef = doc(db, 'employees', id);
        const snapshot = await getDoc(docRef);

        if (!snapshot.exists()) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        await updateDoc(docRef, { status });
        return res.status(200).json({ message: 'Employee updated successfully' });

    } catch (error) {
        console.error('Error updating employee:', error);
        return res.status(500).json({ message: 'Error updating employee', error: error.message });
    }
};

const deleteEmployee = async (req, res) => {
    const { id } = req.params;

    try {
        const docRef = doc(db, 'employees', id);
        const snapshot = await getDoc(docRef);

        if (!snapshot.exists()) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        await deleteDoc(docRef);
        return res.status(200).json({ message: 'Employee deleted successfully' });

    } catch (error) {
        console.error('Error deleting employee:', error);
        return res.status(500).json({ message: 'Error deleting employee', error: error.message });
    }
};

module.exports = {
    createNewAccessCode,
    validateAccessCode,
    createEmployee,
    setupEmployeeAccount,
    getEmployees,
    updateEmployee,
    deleteEmployee
};