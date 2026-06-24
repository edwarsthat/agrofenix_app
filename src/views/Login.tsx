import { useState } from "react"
import FormInput from "../components/UI/FormInput"
import useSessionStore from "../store/useSessionStore"

export default function Login(){
    const login = useSessionStore(data => data.login)
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    const handleLogin = async ():Promise<void> => {
        try {
            console.log(username)
            const response = await login(username, password)
            console.log(response)

        } catch (err){
            console.error(err)
        }
    }

    return(
        <div>
            <h1>Login</h1>
            <FormInput
                name="username"
                label="Usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingresa tu usuario"
            />
            <FormInput
                name="password"
                label="Contraseña"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
            />
            <button onClick={handleLogin}>Login</button>
        </div>
    )
}