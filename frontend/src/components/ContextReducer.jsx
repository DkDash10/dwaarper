import React, { createContext, useContext, useReducer } from 'react'

const CartStateContext = createContext();
const CartDispatchContext = createContext();

const reducer=(state,action)=>{
    switch(action.type){
        case "ADD":
            return[...state, {id:action.id, name:action.name, img: action.img, service:action.service, price:action.price}]
        case "REMOVE":
            let newArr = [...state];
            newArr.splice(action.index, 1);
            return newArr;
            default:
                console.log("Error in Reducer");
    }
}

export const CartProvider = ({children})=> {
    const[state, dispatch] = useReducer(reducer,[])
    return (
        <CartDispatchContext.Provider value={dispatch}>
            <CartStateContext value={state}>
            {children}    
            </CartStateContext>
        </CartDispatchContext.Provider>
    )
}

export const useCart = ()=> useContext(CartStateContext);
export const useDispatchCart = ()=> useContext(CartDispatchContext);


