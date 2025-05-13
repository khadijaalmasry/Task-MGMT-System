import React, {createContext, useState} from 'react';

const AppContext = createContext();
const AppProvider = ({children})=>{

    return(
        <AppContext.Provider value={{}}>
            {children}
        </AppContext.Provider>
    )
}

export {AppContext, AppProvider};