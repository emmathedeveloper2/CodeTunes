import { useContext } from "react";
import { AppContextProps } from "../types";
import { AppContext } from "../state/Provider";


export default function useAppState(){
    return useContext<AppContextProps>(AppContext)
}