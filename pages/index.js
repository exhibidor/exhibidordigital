/**
Este componente muetra la página de inicio que basicamente es el conenedor del componente Login que toma la funcion de carga de la aplicacion y enruta hacia la pagina categorias despues de 2.5 segundos. Utiliza  `<Head>`, que establece los metadatos de la página.

La función `Home()` es la exportación predeterminada de este componente. Devuelve una expresión JSX, que está envuelta en un fragmento (`<>...</>`), que consta de los componentes `<Head>` y `<Login>`. El componente `<Head>` establece el título, la descripción, la ventana gráfica y el favicon de la página.
 */
import Head from "next/head";
import Login from "../components/Login/Login";


export default function Home() {
  return (
    <>
      <Head>
        <title>Exhibidor digital | TL apps</title>
        <meta name="description" content="Inicio de sesion" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicontlapps.svg" />
      </Head>
      <main >
        <Login/>
      </main>
    </>
  );
}
