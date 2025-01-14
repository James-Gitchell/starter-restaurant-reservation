import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { createTable } from "../../utils/api";
import ErrorAlert from "../ErrorAlert";

function NewTable() {

  const initForm = {
    table_name: "",
    capacity: "",
  };
  const initErrors = [];

  /* useEffect deps left out to prevent render loops and other problems */
  const [formData, setFormData] = useState(initForm);
  const [dataToPost, setDataToPost] = useState(null);
  const [dataToValidate, setDataToValidate] = useState(initForm);
  const [dataValidationStage, setDataValidationStage] = useState(null);
  const [dataIsValid, setDataIsValid] = useState(null);
  const [activeErrorState, setActiveErrorState] = useState(null);
  const [displayError, setDisplayError] = useState(initErrors);
  const [errorHandoff, setErrorHandoff] = useState(null);
  const [errorStateComplete, setErrorStateComplete] = useState(null);
  const [dataValidationComplete, setDataValidtionComplete] = useState(null);

  const history = useHistory();

  // Cancel button handler sends user back to previous page.
  const cancelHandler = () => {
    setFormData({ ...initForm });
    return history.goBack();
  };

  // Grabs the form data from inputs and stores the data.
  const formChangeHandler = ({ target }) => {
    setFormData({
      ...formData,
      [target.name]: target.value,
    });

    if (target.name === "capacity") {
      setFormData({
        ...formData,
        [target.name]: Number(target.value),
      });
    };
  };

  // Starts the form data validation process and cleans up previous data submit attempts. 
  const formSubmitHandler = (event) => {
    event.preventDefault();
    // error & validation cleanup
    if (errorStateComplete) {
      setActiveErrorState(null);
      setErrorHandoff(null);
      setDataValidationStage(null);
      setDataValidtionComplete(null);
      setErrorStateComplete(null);
    };

    setDataToValidate({ ...formData, capacity: Number(formData.capacity) });
    setDataValidationStage(true);
  };

  // Validates table data before sending it to the API.
  useEffect(() => {
    if (dataValidationStage) {

      if (!dataToValidate.table_name) {

        if (!displayError.find((errMsg) =>errMsg.message === "Table_name cannot be empty or missing")) {
          setDisplayError([
            ...displayError,
            { message: "Table_name cannot be empty or missing" },
          ]);
        };
      };

      if (dataToValidate.table_name && dataToValidate.table_name.length === 1) {

        if (!displayError.find((errMsg) =>errMsg.message === "Table_name must be longer than one chacter")) {
          setDisplayError([
            ...displayError,
            { message: "Table_name must be longer than one chacter" },
          ]);
        };
      };

      if (!dataToValidate.capacity) {

        if (!displayError.find((errMsg) =>errMsg.message ==="Capacity cannot be missing, and greater than zero")) {
          setDisplayError([
            ...displayError,
            { message: "Capacity cannot missing, or less than zero" },
          ]);
        };
      };

      if (isNaN(dataToValidate.capacity)) {

        if (!displayError.find((errMsg) => errMsg.message === "Capacity must be a number")) {
          setDisplayError([
            ...displayError,
            { message: "Capacity must be a number" },
          ]);
        };
      };
      setDataValidtionComplete(true);
    };
  }, [dataValidationStage, dataToValidate]);

    // Starts the error state or starts the API call for valid data.
  useEffect(() => {
    if (dataValidationComplete) {
      if (displayError.length) {
        setActiveErrorState(true);
        setDataIsValid(false);
      } else {
        setActiveErrorState(false);
        setDataIsValid(true);
      };
    };
  }, [dataValidationComplete]);

  // Error state handler: delivers errors to ErrorAlert and begins cleaning up error state variables. 
  useEffect(() => {
    if (activeErrorState) {
      setErrorHandoff(displayError);
      setDisplayError(initErrors);
      setErrorStateComplete(true);
    }
  }, [activeErrorState]);

  // Hands validated form data off to the 'create' API call.
  useEffect(() => {
    if (dataIsValid) {
      setDataToPost(dataToValidate);
    }
  }, [dataIsValid]);

  // API Call: Creates new tables with validate form data. 
  useEffect(() => {
    if (dataToPost) {
      const abortController = new AbortController();
      createTable(dataToPost, abortController.signal)
        .then((apiResponse) => {
          if (apiResponse.table_id) {
            setDataToPost(null);
            history.push(`/dashboard`);
          }
          return apiResponse;
        })
        .catch((error) => {
          setDisplayError([error]);
          setActiveErrorState(true);
        });
      return () => abortController.abort();
    }
  }, [dataToPost]);

  return (
    <div className="pt-2 pb-3">
      <h1>New Table</h1>
      {activeErrorState && errorHandoff ? (<ErrorAlert error={errorHandoff} />) : null}
      <form onSubmit={formSubmitHandler}>
        <label htmlFor="table_name" className="form-label">Table Name:</label>
        <br />
        <input name="table_name" type="text" id="table_name" className="form-control" placeholder="Enter table name" onChange={formChangeHandler} value={formData.table_name}/>
        <br />
        <label htmlFor="capacity" min="1" className="form-label">Capacity:</label>
        <br />
        <input name="capacity" type="number" id="capacity" className="form-control" placeholder="Number of people" onChange={formChangeHandler} value={formData.capacity}/>
        <br />
        <button type="cancel" className="btn btn-outline-secondary" onClick={cancelHandler}> Cancel </button>
        <button type="submit" className="btn btn-outline-secondary"> Submit </button>
      </form>
    </div>
  );
};

export default NewTable;