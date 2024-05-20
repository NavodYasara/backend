import bcrypt from "bcrypt";
import { db } from "../server.js";

export const registerCaretaker = (req, res) => {
  const { firstName, lastName, userName, password, mobileNo, dob, address } =
    req.body;
  const userType = "caretaker";

  if (!userName || !password) {
    return res
      .status(400)
      .json({ error: "User Name and password are required" });
  }

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      console.error("Error during registration:", err);
      return res
        .status(500)
        .json({ error: "Internal Server Error", details: err.message });
    }

    db.query(
      "SELECT * FROM usernew WHERE userName = ? AND userType = ?",
      [userName, userType],
      (err, results) => {
        if (err) {
          console.error("Error during registration:", err);
          return res
            .status(500)
            .json({ error: "Internal Server Error", details: err.message });
        }

        if (results.length > 0) {
          return res.status(409).json({ error: "Username already exists" });
        }

        db.query(
          "INSERT INTO usernew SET ?",
          {
            firstName,
            lastName,
            userName,
            password: hash,
            userType,
            mobileNo,
            dob,
          },
          (err, results) => {
            if (err) {
              console.error("Error during registration:", err);
              return res
                .status(500)
                .json({ error: "Internal Server Error", details: err.message });
            }

            const userId = results.insertId;

            db.query(
              "INSERT INTO useraddress (address, userId) VALUES (?, ?)",
              [address, userId],
              (err, results) => {
                if (err) {
                  console.error("Error during address data insertion:", err);
                  return res
                    .status(500)
                    .json({
                      error: "Internal Server Error",
                      details: err.message,
                    });
                }

                res
                  .status(201)
                  .json({
                    message: "User and caretaker data registered successfully",
                  });
              }
            );
          }
        );
      }
    );
  });
};


//########################################################################################
// Controller function to Login user

export const login = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  db.query(
    "SELECT * FROM usernew WHERE username = ?",
    [username],
    (err, results) => {
      if (err) {
        console.error("Error during login:", err);
        return res
          .status(500)
          .json({ error: "Internal Server Error", details: err.message });
      }

      if (results.length === 0) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      bcrypt.compare(password, results[0].password, (err, isMatch) => {
        if (err) {
          console.error("Error during login:", err);
          return res
            .status(500)
            .json({ error: "Internal Server Error", details: err.message });
        }

        if (!isMatch) {
          return res
            .status(401)
            .json({ error: "Invalid username or password" });
        }

        // Login successful, include user type in the response
        const userType = results[0].userType;
        res.status(200).json({ message: "Login successful", userType });
      });
    }
  );
};

// ############################################################################################

export const userDetails = (req, res) => {
  const query = "SELECT * FROM usernew";

  db.query(query, (err, results) => {
    if (err) {
      console.error(err.message);
      res.status(500).json(err.message);
    } else {
      res.json(results);
    }
  });
};

//#############################################################################################
// Controller function to retrieve all caretaker details from the database

export const getCaretakerDetails = (req, res) => {
  const query = "SELECT * FROM caretaker";

  db.query(query, (err, results) => {
    if (err) {
      console.error(err.message);
      res
        .status(500)
        .json({ error: "Internal Server Error", details: err.message });
    } else {
      res.json(results);
    }
  });
};

//########################################################################################
// Controller function to retrieve relevent patient by their caretakerID

export const getCareTakerById = (req, res) => {
  const userId = req.params.id;
  const query = "SELECT * FROM caretaker WHERE userId = ?";

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error(err.message);
      res
        .status(500)
        .json({ error: "Internal Server Error", details: err.message });
    } else {
      res.json(results);
    }
  });
};

//########################################################################################
// controller function to register a new patient

export const registerPatient = (req, res) => {
  const {
    firstName,
    lastName,
    dob,
    mobileNo,
    emergCont,
    category,
    address,
    mediCondition,
  } = req.body;

  db.query(
    "SELECT * FROM caretakernew WHERE firstName = ? AND lastName = ?",
    [firstName, lastName],
    (err, results) => {
      if (err) {
        console.error("Error during registration:", err);
        return res
          .status(500)
          .json({ error: "Internal Server Error", details: err.message });
      }

      if (results.length > 0) {
        return res.status(409).json({ error: "Patient already exists" });
      }

      db.query(
        "INSERT INTO caretakernew SET ?",
        {
          firstName,
          lastName,
          dob,
          mobileNo,
          emergCont,
          category,
          address,
          mediCondition,
        },
        (err, results) => {
          if (err) {
            console.error("Error during registration:", err);
            return res
              .status(500)
              .json({ error: "Internal Server Error", details: err.message });
          }

          const userId = results.insertId;

          db.query(
            "INSERT INTO caretakeraddress (address, userId) VALUES (?, ?)",
            [address, userId],
            (err, results) => {
              if (err) {
                console.error("Error during address data insertion:", err);
                return res
                  .status(500)
                  .json({
                    error: "Internal Server Error",
                    details: err.message,
                  });
              }

              res.status(201).json({
                message: "User and caretaker address registered successfully",
              });
            }
          );

          db.query(
            "INSERT INTO caretakerMedicondition (mediCondition, userId) VALUES (?, ?)",
            [mediCondition, userId],
            (err, results) => {
              if (err) {
                console.error(
                  "Error during mediCondition data insertion:",
                  err
                );
                return res
                  .status(500)
                  .json({
                    error: "Internal Server Error",
                    details: err.message,
                  });
              }

              res.status(201).json({
                message:
                  "User and caretaker medical condition data registered successfully",
              });
            }
          );
        }
      );
    }
  );
};
