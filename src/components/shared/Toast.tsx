import { motion } from "framer-motion"
import { ToastProps } from "../../types"
import { Check, Info, MessageSquareWarning, X } from "lucide-react"

type ToastComponentProps = {
    toast: ToastProps
}

const Toast = ({ toast } : ToastComponentProps) => {

  return (
    <motion.div initial={{ translateY: '100%' , translateX: '-50%' }} animate={{ translateY: 0 , translateX: '-50%' }} className="fixed bottom-4 left-1/2 -translate-x-1/2 rounded-md p-4 z-[2000] bg-re flex items-center justify-between bg-white min-w-[500px] font-geist-medium text-black shadow-lg">
        <p>{toast.message}</p>
        
        {toast.type === 'success' &&  <Check stroke="rgb(34 197 94)"/>}
        {toast.type === 'info' &&  <Info stroke="rgb(37 99 235)"/>}
        {toast.type === 'warning' &&  <MessageSquareWarning stroke="#facc15"/>}
        {toast.type === 'error' &&  <X stroke="#ef4444"/>}
    </motion.div>
  )
}

export default Toast
