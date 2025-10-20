import { createContext } from "react";

export const Context = createContext();
const ContextProvider = (props) => {
  const apiUrl = import.meta.env.VITE_API_URL;
  return (
    <Context.Provider value={{ apiUrl }}>{props.children}</Context.Provider>
  );
};
export default ContextProvider;
