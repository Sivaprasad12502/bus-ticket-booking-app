import React, { useContext, useState } from "react";
import { Context } from "../../context/Context";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import useForm from "../../hooks/useForm/useForm";
import axios from "axios";
import "./AdminOperators.scss";
import { FaEdit, FaTrash, FaUser } from "react-icons/fa";
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
      password: "",
    });
  };

  if (!operators) {
    return <div>Loading...operators</div>;
  }

  return (
    <div className="admin-operator-page">
      <h2>
        <FaUser /> Manage Operators
      </h2>

      {/* operator form */}
      <form onSubmit={handleOperatorSubmit} className="admin-operator-form">
        <div className="form-group">
          <label htmlFor="username">Enter operatorname</label>
          <input
            type="text"
            name="username"
            placeholder="Operator Name"
            value={values.username}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="company_name">Enter company_name</label>
          <input
            type="text"
            name="company_name"
            placeholder="enter_company_name"
            value={values.company_name}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="phone">Enter phone</label>
          <input
            type="number"
            name="phone"
            value={values.phone}
            placeholder="Phone"
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Enter Password</label>
          <input
            type="password"
            name="password"
            value={values.password}
            placeholder="Password"
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="btn btn--primary">
          {editingOperator ? "Update Operator" : "Add Operator"}
        </button>
        {editingOperator && (
          <button
            onClick={() => {
              seEditingOperator(null), resetForm();
            }}
            className="btn btn--secondary"
          >
            Cancel
          </button>
        )}
      </form>

      {/* operator List */}
      {isLoading ? (
        <p>Loading operators...</p>
      ) : (
        <div className="table-wrapper">
          <table className="admin-list">
            <thead>
              <tr>
                <th>operatorname</th>
                <th>company_name</th>
                <th>phone</th>
                <th>actions</th>
              </tr>
            </thead>
            <tbody>
              {operators?.map((o) => (
                <tr key={o.id}>
                  <td>{o.username}</td>
                  <td>{o.company_name}</td>
                  <td>{o.phone}</td>
                  <td className="actions">
                    <button onClick={() => handleEditOperator(o)}>
                      <FaEdit />
                    </button>
                    <button onClick={() => deleteOperator.mutate(o.id)}>
                      <FaTrash className="delete"/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminOperators;
