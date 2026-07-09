import { useState, FormEvent } from "react"
import FormInput from "../../components/UI/FormInput/FormInput"
import FenixButton from "../../components/UI/Button/FenixButton"
import useSessionStore from "../../store/useSessionStore"
import logo from "../../assets/logo.png"
import styles from "./LoginForm.module.css"

export default function Login(){
    const login = useSessionStore(data => data.login)
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)

    const handleLogin = async (e: FormEvent):Promise<void> => {
        e.preventDefault()
        try {
            setLoading(true)
            await login(username, password)
        } catch (err){
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return(
        <div className={styles.page}>
            <aside className={styles.brandPanel}>
                <div>
                    <p className={styles.brandTagline}>agroalimentos</p>
                    <p className={styles.brandWordmark}>Fénix</p>
                </div>
                <p className={styles.brandSub}>
                    Gestiona tu operación agroalimentaria desde un solo lugar.
                </p>
            </aside>

            <div className={styles.formPanelOuter}>
                <form className={styles.formPanel} onSubmit={handleLogin}>
                    <img src={logo} alt="Agroalimentos Fénix" className={styles.logo} />
                    <h1 className={styles.title}>Iniciar sesión</h1>
                    <p className={styles.subtitle}>Ingresa tus credenciales para continuar</p>

                    <div className={styles.fields}>
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
                    </div>

                    <FenixButton type="submit" fullWidth disabled={loading}>Login</FenixButton>
                </form>
            </div>
        </div>
    )
}
