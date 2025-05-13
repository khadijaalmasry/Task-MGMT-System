import React, {createContext} from "react";

const initialState = {};
const updater = (state, action) => {
    switch (action.type) {
        case "ADD":
            return {...state, [action.payload.key]: action.payload.value};
        case "REMOVE":
            const newState = {...state};
            delete newState[action.payload.key];
            return newState;
        default:
            return state;
    }
}
const ReducerContext = createContext();
const ReducerProvider = ({children}) => {
    const [state, dispatch] = React.useReducer(updater, initialState);
    return(
        <ReducerContext.Provider value = {{state, dispatch}}>
            {children}
        </ReducerContext.Provider>
    )
}
export {ReducerContext, ReducerProvider};