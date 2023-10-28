import { useEffect, useState } from "react";
import { getCurrentUser, deleteUser, logout } from "../services/auth.service";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { styled } from "@mui/material/styles";
import { NavigateFunction, useNavigate, useLocation } from "react-router-dom";
import { Alert, TextField } from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  getUserProfile,
  updateUserPassword,
  updateUserProfile,
} from "../services/user.service";
import profilepic from "../images/profilepicture.png";

interface User {
  username: string;
  email: string;
  roles: string[];
  id: string;
}

const CustomDialog = styled(Dialog)``;

const CustomDialogTitle = styled(DialogTitle)`
  font-weight: bold;
`;

const CustomDialogContent = styled(DialogContent)`
  padding: 20px;
`;

const CustomDialogActions = styled(DialogActions)`
  justify-content: space-between;
`;

const BackButton = styled(Button)`
  background-color: #d8d8d8;
  color: white;
  font-weight: bold;
  &:hover {
    background-color: #6c63ff;
  }
`;

const Profile: React.FC = () => {
  const currentUser = getCurrentUser();
  const [profile, setProfile] = useState<User | null>(null);
  const [userErrorMessage, setUserErrorMessage] = useState("");
  const [openUpdateUserModel, setOpenUpdateUserModal] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const [openUpdatePasswordModel, setOpenUpdatePasswordModal] = useState(false);
  const [openDeleteModel, setOpenDeleteModal] = useState(false);
  const [showPasswordTextFields, setShowPasswordTextFields] = useState(false);
  const [textFieldsEnabled, setTextFieldsEnabled] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorType, setErrorType] = useState("");
  const [passwordButtonClicked, setPasswordButtonClicked] = useState(false);
  const [buttonWidth, setButtonWidth] = useState("97%");
  const [showBackButton, setShowBackButton] = useState(false);
  const [isTextFieldClicked, setIsTextFieldClicked] = useState(false);
  const isAdmin = currentUser && currentUser.roles.includes("ROLE_ADMIN");

  const enableTextField = () => {
    setIsTextFieldClicked(true);
  };

  const toggleTextFields = () => {
    setShowPasswordTextFields(!showPasswordTextFields);
    setTextFieldsEnabled(false);
    setPasswordButtonClicked(true);
    setShowBackButton(!showBackButton);
  };

  useEffect(() => {
    const id = getCurrentUser().id;
    getUserProfile(currentUser.accessToken)
      .then((response) => {
        setProfile(response.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  // const location = useLocation();
  // const setCurrentUser = location.state;
  let navigate: NavigateFunction = useNavigate();
  // delete code
  const toggleDeleteModal = () => {
    setOpenDeleteModal(!openDeleteModel);
  };

  const deleteUserAccount = async () => {
    try {
      await deleteUser();
      logout();
    } catch (err) {
      // useState to log api error?
      console.log(err);
    } finally {
      // need to figure out how to not force it without context
      navigate("/login");
      window.location.reload();
    }
  };

  // update user
  const toggleUpdateUserModal = () => {
    setOpenUpdateUserModal(!openUpdateUserModel);
  };

  const updateProfileSchema = Yup.object().shape({
    username: Yup.string()
      .test(
        "len",
        "The username must be between 3 and 20 characters.",
        (val: any) =>
          val && val.toString().length >= 3 && val.toString().length <= 20
      )
      .required("This field is required!"),
    email: Yup.string()
      .email("This is not a valid email.")
      .required("This field is required!"),
  });

  const updateFormik = useFormik({
    initialValues: {
      username: profile?.username,
      email: profile?.email,
    },
    validationSchema: updateProfileSchema,
    onSubmit: (values, { resetForm }) => {
      updateUserProfile(values, currentUser.accessToken)
        .then((response) => {
          console.log(response);
          // console.log(values);
          setProfile((prevProfile) => {
            if (!prevProfile) {
              return null;
            }
            return {
              ...prevProfile,
              username: values.username || prevProfile.username,
              email: values.email || prevProfile.email,
            };
          });
          setUserErrorMessage("");
          resetForm();
          toggleUpdateUserModal();
          setShowSuccessModal(true);
        })
        .catch((err) => {
          console.log(err);
          setUserErrorMessage(err.response.data.message);
          setErrorType("user");
          setShowErrorModal(true);
        });
    },
    enableReinitialize: true,
  });

  //Update Password
  const toggleUpdatePasswordModal = () => {
    setOpenUpdatePasswordModal(!openUpdatePasswordModel);
  };

  const updatePasswordSchema = Yup.object().shape({
    currentPassword: Yup.string()
      .test(
        "len",
        "The password is be between 6 and 40 characters.",
        (val: any) =>
          val && val.toString().length >= 6 && val.toString().length <= 40
      )
      .required("This field is required!"),
    newPassword: Yup.string()
      .test(
        "len",
        "The password must be between 6 and 40 characters.",
        (val: any) =>
          val && val.toString().length >= 6 && val.toString().length <= 40
      )
      .required("This field is required!"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("newPassword"), ""], "Passwords must match")
      .required("This field is required!"),
  });

  const passwordFormik = useFormik({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: updatePasswordSchema,
    onSubmit: (values, { resetForm }) => {
      const { currentPassword, newPassword } = values;
      updateUserPassword(
        { currentPassword, newPassword },
        currentUser.accessToken
      )
        .then((response) => {
          console.log(response);
          setUserErrorMessage("");
          resetForm();
          toggleUpdatePasswordModal();
          setShowSuccessModal(true);
        })
        .catch((err) => {
          // console.log(err);
          // console.log(err.response.data)
          setPasswordErrorMessage(err.response.data.message);
          setErrorType("password");
          setShowErrorModal(true);
        });
    },
    enableReinitialize: true,
  });

  return (
    <div className="container">
      <div
        className="jumbotron"
        style={{ borderRadius: "10px", backgroundColor: "#E6E6E6", paddingLeft: "12px" }}
      >
        <form onSubmit={updateFormik.handleSubmit}>
          <div className="container">
            <div className="row justify-content-center align-items-center">
              <div className="col-12 col-md-4">
                <div className="d-flex align-items-center justify-content-center">
                  <img src={profilepic} alt="picture" className="img-fluid" />
                </div>
              </div>
              <div className="col-12 col-md-7">
                <div className="row justify-content-center align-items-center">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginTop: "20px",
                    }}
                  >
                    <label htmlFor="username" style={{ position: "relative", fontSize: '18px' }}>
                      Username
                    </label>
                    <TextField
                      autoFocus
                      margin="dense"
                      id="username"
                      name="username"
                      type="text"
                      disabled={!textFieldsEnabled}
                      onChange={updateFormik.handleChange}
                      value={updateFormik.values.username}
                      onBlur={updateFormik.handleBlur}
                      error={
                        updateFormik.touched.username &&
                        Boolean(updateFormik.errors.username)
                      }
                      helperText={
                        updateFormik.touched.username &&
                        updateFormik.errors.username
                      }
                      InputProps={{
                        style: {
                          borderRadius: "20px",
                          backgroundColor: "white",
                        },
                      }}
                      style={{
                        borderRadius: "20px",
                        lineHeight: "3rem",
                        margin: 0,
                        width: "60%",
                        left: "25%",
                      }}
                    />
                  </div>
                </div>
                <div className="row justify-content-center align-items-center">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginTop: "20px",
                    }}
                  >
                    <label
                      htmlFor="email"
                      style={{
                        position: "relative",
                        paddingRight: "40px",
                        fontSize: '18px'
                      }}
                    >
                      Email
                    </label>
                    <TextField
                      autoFocus
                      margin="dense"
                      id="email"
                      name="email"
                      type="text"
                      disabled={!textFieldsEnabled}
                      onChange={updateFormik.handleChange}
                      value={updateFormik.values.email}
                      onBlur={updateFormik.handleBlur}
                      error={
                        updateFormik.touched.email &&
                        Boolean(updateFormik.errors.email)
                      }
                      helperText={
                        updateFormik.touched.email && updateFormik.errors.email
                      }
                      InputProps={{
                        style: {
                          borderRadius: "20px", // Set the border radius
                          backgroundColor: "white",
                        },
                      }}
                      style={{
                        borderRadius: "20px",
                        lineHeight: "3rem",
                        margin: 0,
                        width: "60%",
                        left: "25%",
                      }}
                    />
                  </div>
                </div>

                {!showPasswordTextFields && (
                  <div className="row justify-content-center align-items-center">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginTop: "20px",
                      }}
                    >
                      <label
                        htmlFor="password"
                        style={{ position: "relative", paddingRight: "5px", fontSize: '18px'}}
                      >
                        Password
                      </label>
                      <Button
                        onClick={toggleTextFields}
                        style={{
                          color: "black",
                          backgroundColor: "#D9D9D9",
                          borderRadius: "20px",
                          lineHeight: "2.5rem",
                          margin: 0,
                          width: "60%",
                          left: "25%",
                        }}
                      >
                        Change Password
                      </Button>
                    </div>
                  </div>
                )}

                {showPasswordTextFields && (
                  <>
                    <div className="row justify-content-center align-items-center">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginTop: "20px",
                        }}
                      >
                        <label
                          htmlFor="currentPassword"
                          style={{
                            position: "relative",
                            marginRight: "-54px",
                          }}
                        >
                          Current Password
                        </label>
                        <TextField
                          autoFocus
                          margin="dense"
                          id="currentPassword"
                          name="currentPassword"
                          type="password"
                          value={passwordFormik.values.currentPassword}
                          onChange={passwordFormik.handleChange}
                          onBlur={passwordFormik.handleBlur}
                          error={
                            passwordFormik.touched.currentPassword &&
                            Boolean(passwordFormik.errors.currentPassword)
                          }
                          helperText={
                            passwordFormik.touched.currentPassword &&
                            passwordFormik.errors.currentPassword
                          }
                          InputProps={{
                            readOnly: !isTextFieldClicked,
                            onClick: enableTextField,
                            style: {
                              borderRadius: "20px",
                              backgroundColor: "white",
                            },
                          }}
                          style={{
                            borderRadius: "20px",
                            lineHeight: "3rem",
                            margin: 0,
                            width: "60%",
                            left: "25%",
                          }}
                        />
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginTop: "20px",
                      }}
                    >
                      <label
                        htmlFor="newPassword"
                        style={{
                          position: "relative",
                          marginRight: "-31px",
                        }}
                      >
                        New Password
                      </label>
                      <TextField
                        margin="dense"
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        value={passwordFormik.values.newPassword}
                        onChange={passwordFormik.handleChange}
                        onBlur={passwordFormik.handleBlur}
                        error={
                          passwordFormik.touched.newPassword &&
                          Boolean(passwordFormik.errors.newPassword)
                        }
                        helperText={
                          passwordFormik.touched.newPassword &&
                          passwordFormik.errors.newPassword
                        }
                        InputProps={{
                          style: {
                            borderRadius: "20px",
                            backgroundColor: "white",
                          },
                        }}
                        style={{
                          borderRadius: "20px",
                          lineHeight: "3rem",
                          margin: 0,
                          width: "60%",
                          left: "25%",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginTop: "20px",
                      }}
                    >
                      <label
                        htmlFor="confirmPassword"
                        style={{
                          position: "relative",
                          marginRight: "-55px",
                        }}
                      >
                        Confirm Password
                      </label>
                      <TextField
                        margin="dense"
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={passwordFormik.values.confirmPassword}
                        onChange={passwordFormik.handleChange}
                        onBlur={passwordFormik.handleBlur}
                        error={
                          passwordFormik.touched.confirmPassword &&
                          Boolean(passwordFormik.errors.confirmPassword)
                        }
                        helperText={
                          passwordFormik.touched.confirmPassword &&
                          passwordFormik.errors.confirmPassword
                        }
                        InputProps={{
                          style: {
                            borderRadius: "20px",
                            backgroundColor: "white",
                          },
                        }}
                        style={{
                          borderRadius: "20px",
                          lineHeight: "3rem",
                          margin: 0,
                          width: "60%",
                          left: "25%",
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* <Button onClick={toggleUpdateUserModal}>Cancel</Button> */}

            <div className="row justify-content-center align-items-center">
              <div className="col-12 col-md-4 d-flex justify-content-center align-items-center">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginTop: "20px",
                  }}
                >
                {!isAdmin && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggleDeleteModal();
                    }}
                    style={{
                      position: "relative",
                      border: "none",
                      textDecoration: "underline",
                      color: "#9BA4B5",
                      background: "none",
                    }}
                  >
                    delete account
                  </button>)}
                </div>
              </div>
              <div className="col-12 col-md-7 justify-content-center align-items-center">
                <div
                className="w-100"
                  style={{
                    marginTop: "20px",
                  }}
                >
                  {showBackButton && (
                    <Button
                      onClick={(e) => {
                        setButtonWidth("100%");
                        e.preventDefault(); // Prevent form submission
                        setShowBackButton(!showBackButton);
                        setPasswordButtonClicked(!passwordButtonClicked);
                        setShowPasswordTextFields(!showPasswordTextFields);
                      }}
                      style={{
                        color: "black",
                        backgroundColor: "#D9D9D9",
                        borderRadius: "20px",
                        lineHeight: "2.5rem",
                        marginRight: "15%",
                        right: "1%",
                        width: buttonWidth,
                      }}
                    >
                      Back
                    </Button>
                  )}
                  <Button
                    onClick={(e) => {
                      e.preventDefault(); // Prevent form submission
                      if (!textFieldsEnabled && !passwordButtonClicked) {
                        setTextFieldsEnabled(true);
                      } else {
                        setTextFieldsEnabled(false);
                        if (!passwordButtonClicked) {
                          updateFormik.handleSubmit(); // Call the Update Profile method
                        } else {
                          setButtonWidth("46%");
                          passwordFormik.handleSubmit(); // Call the Update Password method
                        }
                      }
                    }}
                    style={{
                      color:
                        textFieldsEnabled || passwordButtonClicked
                          ? "white"
                          : "black",
                      backgroundColor:
                        textFieldsEnabled || passwordButtonClicked
                          ? "#6C63FF"
                          : "#D9D9D9",
                      borderRadius: "20px",
                      lineHeight: "2.5rem",
                      margin: 0,
                      right: passwordButtonClicked ? "3.5%" : "0",
                      width: buttonWidth,
                    }}
                  >
                    {textFieldsEnabled || passwordButtonClicked
                      ? "Save"
                      : "Edit Profile"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* delete user */}
      <div>
        <CustomDialog
          open={openDeleteModel}
          onClose={toggleDeleteModal}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          PaperProps={{
            sx: { bgcolor: "lightgray", borderRadius: "20px", padding: "5px" },
          }}
        >
          <CustomDialogTitle
            id="alert-dialog-title"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {`Confirm to delete account.`}
          </CustomDialogTitle>
          <CustomDialogContent>
            <DialogContentText
              id="alert-dialog-description"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Note: All history will be deleted.
            </DialogContentText>
          </CustomDialogContent>
          <CustomDialogActions sx={{ justifyContent: "space-between" }}>
            <Button
              onClick={toggleDeleteModal}
              style={{
                fontSize: "18px",
                backgroundColor: "white",
                borderRadius: "20px",
                color: "black",
                textTransform: "none",
                margin: "0 auto",
                paddingLeft: "30px",
                paddingRight: "30px",
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={deleteUserAccount}
              autoFocus
              style={{
                fontSize: "18px",
                backgroundColor: "#FF6A6A",
                borderRadius: "20px",
                color: "white",
                textTransform: "none",
                margin: "0 auto",
                paddingLeft: "30px",
                paddingRight: "30px",
              }}
            >
              Confirm
            </Button>
          </CustomDialogActions>
        </CustomDialog>
      </div>

      {/* Error */}
      <div>
        <CustomDialog
          open={showErrorModal}
          onClose={() => setShowErrorModal(false)}
          aria-labelledby="error-dialog-title"
          aria-describedby="error-dialog-description"
          PaperProps={{
            sx: { bgcolor: "lightgray", borderRadius: "20px", padding: "5px" },
          }}
        >
          <CustomDialogTitle
            id="error-dialog-title"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Error
          </CustomDialogTitle>
          <CustomDialogContent>
            <DialogContentText id="error-dialog-description">
              {/* Current password is incorrect. */}
              {errorType === "password" && passwordErrorMessage}
              {errorType === "user" && userErrorMessage}
            </DialogContentText>
          </CustomDialogContent>
          <CustomDialogActions>
            <Button
              onClick={() => setShowErrorModal(false)}
              style={{
                fontSize: "18px",
                backgroundColor: "white",
                borderRadius: "20px",
                color: "black",
                textTransform: "none",
                margin: "0 auto",
                paddingLeft: "30px",
                paddingRight: "30px",
              }}
            >
              Close
            </Button>
          </CustomDialogActions>
        </CustomDialog>
      </div>

      {/* Success */}
      <div>
        <CustomDialog
          open={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          aria-labelledby="success-dialog-title"
          aria-describedby="success-dialog-description"
          PaperProps={{
            sx: { bgcolor: "lightgray", borderRadius: "20px", padding: "5px" },
          }}
        >
          <CustomDialogTitle
            id="success-dialog-title"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Success
          </CustomDialogTitle>
          <CustomDialogContent>
            <DialogContentText
              id="success-dialog-description"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Successfully updated!
            </DialogContentText>
          </CustomDialogContent>
          <CustomDialogActions>
            <Button
              onClick={() => setShowSuccessModal(false)}
              style={{
                fontSize: "18px",
                backgroundColor: "#6C63FF",
                borderRadius: "20px",
                color: "white",
                textTransform: "none",
                margin: "0 auto",
                paddingLeft: "30px",
                paddingRight: "30px",
              }}
            >
              Close
            </Button>
          </CustomDialogActions>
        </CustomDialog>
      </div>
    </div>
  );
};

export default Profile;
