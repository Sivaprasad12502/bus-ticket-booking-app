import React, { useContext, useState } from "react";
import { Context } from "../../context/Context";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import useForm from "../../hooks/useForm/useForm";
import axios from "axios";
import "./AdminOperators.scss"
const AdminOperators = () => {
  const { apiUrl, adminAccessToken } = useContext(Context);
  const queryClient = useQueryClient();
  const { values, setValues, handleChange, resetForm } = useForm({
    username: "",
    password: "",
    company_name: "",
    phone: "",
  });
  const [editingOperator, seEditingOperator] = useState(null);

  const {
    data: operators,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["operators"],
    queryFn: async () => {
      const res = await axios.get(`${apiUrl}users/operators/`, {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
        },
      });
      return res.data;
    },
    onSuccess: (operators) => {
      console.log("Admin Operators data:", operators);
    },
    onError: (error) => {
      console.error("Admin Operators error:", error);
    },
  });
  if (operators) {
    console.log("Admin operators data", operators);
  }

  const addOperator = useMutation({
    mutationFn: async (operator) => {
      const res = await axios.post(
        `${apiUrl}users/operator/register/`,
        operator,
        {
          headers: { Authorization: `Bearer ${adminAccessToken}` },
        }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["operators"]);
      resetForm();
    },
    onError: (error) => {
      console.log("Error in adding operator", error);
    },
    //Edit Operator
  });
  const editOperator = useMutation({
    mutationFn: async (operator) => {
      const res = await axios.put(
        `${apiUrl}users/operator/${operator.id}/`,
        operator,
        {
          headers: { Authorization: `Bearer ${adminAccessToken}` },
        }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["operators"]);
      seEditingOperator(null);
      resetForm();
    },
  });
  const deleteOperator = useMutation({
    mutationFn: async (id) => {
      const res = await axios.delete(`${apiUrl}users/operator/${id}/`, {
        headers: { authorization: `Bearer ${adminAccessToken}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["operators"]);
    },
    onError: (error) => {
      console.log("error in deleting operator", error);
    },
  });

  const handleOperatorSubmit = (e) => {
    console.log("form values", values);
    e.preventDefault();
    if (editingOperator) editOperator.mutate({ ...editingOperator, ...values });
    else addOperator.mutate(values);
  };
  const handleEditOperator = (operator) => {
    seEditingOperator(operator);
    setValues({
      username: operator.username,
      company_name: operator.company_name,
      phone: operator.phone,
      password:"",
    });
  };

  if (!operators) {
    return <div>Loading...operators</div>;
  }

  return (
    <div className="admin-operator-page">
      <h2>Manage Operators</h2>

      {/* operator form */}
      <form onSubmit={handleOperatorSubmit} className="admin-operator-form">
        <label htmlFor="">
          Enter operatorname
          <input
            type="text"
            name="username"
            placeholder="Operator Name"
            value={values.username}
            onChange={handleChange}
          />
        </label>
        <label>
          Enter company_name
          <input
            type="text"
            name="company_name"
            value={values.company_name}
            onChange={handleChange}
          />
        </label>
        <input
          type="number"
          name="phone"
          value={values.phone}
          placeholder="Phone"
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          value={values.password}
          placeholder="Password"
          onChange={handleChange}
        />

        <button type="submit">
          {editingOperator ? "Update Operator" : "Add Operator"}
        </button>
      </form>

      {/* operator List */}
      {isLoading ? (
        <p>Loading operators...</p>
      ) : (
        <ul className="admin-list">
          {operators?.map((o) => (
            <li key={o.id}>
              <span>{o.username}</span>
              <span>{o.company_name}</span>
              <span>{o.phone}</span>
              <div className="actions">
                <button onClick={() => handleEditOperator(o)}>✏️ Edit</button>
                <button onClick={() => deleteOperator.mutate(o.id)}>
                  🗑️ Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminOperators;
