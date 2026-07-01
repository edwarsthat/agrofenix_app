import useSessionStore from '../../store/useSessionStore'

export default function SideBar() {
    const permisos = useSessionStore((state) => state.permisos)
    return (
        <div>
            {
                permisos?.map((permiso) => (
                    <div key={permiso}>
                        <h3>{permiso}</h3>
                    </div>
                ))
            }
        </div>
    )
}