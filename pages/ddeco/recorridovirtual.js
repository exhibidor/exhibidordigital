
// Este componente el recorrido virtual usando un iframe, junto con un encabezado y un pie de página. 

// El componente de la función devuelve un fragmento que contiene:
//    - Un componente Head que establece el título, la descripción, la ventana gráfica y el favicon para la página.
//    - Un componente NavBar que representa una barra de navegación en la parte superior de la página.
//    - Una etiqueta main con la clase "frame_container" que contiene un elemento iframe.
//    - El elemento iframe representa un recorrido virtual utilizando una URL de Matterport.
//    - El componente Footer que representa un pie de página en la parte inferior de la página.

// En general, este componente es una página simple que muestra un recorrido virtual usando un iframe junto con un encabezado y un pie de página para la navegación.


import Head from "next/head";
import NavBar from "../../ddecocomponents/NavBar/NavBar";
import Footer from '../../ddecocomponents/Footer/Footer'
import axios from "axios";


export default function recorridoVirtual({products, categories, categoriesFiltered, ddecoCategory}) {
  return (
    <>
      <Head>
        <title>Recorrido virtual | TLapps ddeco</title>
        <meta name="description" content="Recorrido virtual" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicontlapps.svg" />
      </Head>
      <NavBar
        categories={categories}
        categoriesFiltered={categoriesFiltered}
        products={products}
        ddecoCategory={ddecoCategory}
      />
      <main className="frame_container">
        <iframe
          src="https://my.matterport.com/show/?m=VdY42iYK1r5&play=1"
          className="frame"
        />
      </main>
        <Footer/>
    </>
  );
}


export async function getStaticProps() {
  const categoriesFiltered = [];
  const allCategories = await axios.get(
    "https://tlappshop.com/apis/api/sub-categories?filters[catalogo][$eq]=true&filters[category][category][$eq]=Tlapps ddeco&populate=*&pagination[limit]=800"
  );
  const allProducts = await axios.get(
    "https://tlappshop.com/apis/api/products?populate=sub_category,categories,thumbnail,ficha,instructivo,accesorios,galeria&filters[categories][category][$eq]=Tlapps ddeco&pagination[limit]=800"
  );

  //En esta peticion se obtienen las imagenes del backround de la carta de la categoria ddeco del exhibidor, la imagen de fondo de la seccion home ddeco y el logo de la misma 
  const oneDdecoCategory = await axios.get(
    "https://tlappshop.com/apis/api/categories?filters[codigo][$eq]=155&populate=cover,background,thumbnail"
  );


  const ddecoCategory = oneDdecoCategory.data.data.map(item => (
    {
      cardImg: item.attributes.cover.data.attributes.formats.large.url,
      bgImage: item.attributes.background.data.map(item => item.attributes.formats.large.url),
      logoDdeco: item.attributes.thumbnail.data.map(item => item.attributes.url)
    }
  ))

  const categories = allCategories.data.data.map((item) => ({
    id: item.id,
    category: item.attributes.subCategory,
    img: item.attributes.cover.data.map((item) => item.attributes.url),
    bgImage: item.attributes.background.data?.map((item) => item.attributes.formats.large.url) == null || item.attributes.background.data?.map((item) => item.attributes.formats.large.url) == undefined ? [ "https://exhibidorddeco.vercel.app/_next/image?url=https%3A%2F%2Ftlappshop-imagenes.s3.amazonaws.com%2FNo_image_available_svg_731bcb13d0.png&w=128&q=75"] :item.attributes.background.data?.map((item) => item.attributes.formats.large.url),
    thumbImg: item.attributes.thumbnail.data.map(item => item.attributes.url),
  }));


  const products = allProducts.data.data.map((item) => ({
    id: item.id,
    name: item.attributes.description,
    codigo: item.attributes.sku,
    volt: item.attributes.voltaje,
    img: item.attributes.thumbnail.data == null || item.attributes.thumbnail.data == undefined ? "https://exhibidorddeco.vercel.app/_next/image?url=https%3A%2F%2Ftlappshop-imagenes.s3.amazonaws.com%2FNo_image_available_svg_731bcb13d0.png&w=128&q=75": item.attributes.thumbnail.data?.attributes.url,
    category: item.attributes.sub_category.data.attributes.subCategory,
  }));



  //Renderizado condicional de categorias en relacion a la existencia del producto

  const categoryProductFiltered = Array.from(
    new Set(
      allProducts.data.data
        .map((item) => item.attributes.sub_category.data.attributes.subCategory)
        .flat(1)
    )
  );
  
  /* Este código compara la longitud de dos arreglos, `categorías` y `categoríaProductoFiltrado`, y
  asignando la mayor longitud a la variable `categoryFilterLength`. Entonces, está iterando sobre los
  arreglos `categories` y `categoryProductFiltered` usando bucles for anidados, y empujando la coincidencia
  categorías a una nuevo arreglo llamado `categoriesFiltered`. El propósito de este código es filtrar sobre
  categorías basadas en la existencia de productos en cada categoría, y cree un nuevo arreglo con solo las
  categorías que tienen productos, asegurando que el numero de iteraciones siempre sea tomado del arreglo con
  la longitud mayor para que se itere sobre todas las categorias. */
  
  let categoryFilterLength = 0;
  
  categoryFilterLength =
  categories.length > categoryProductFiltered.length
  ? (categoryFilterLength = categories.length)
  : (categoryFilterLength = categoryProductFiltered.length);
  
  for (let i = 0; i < categoryFilterLength; i++) {
    for (let j = 0; j < categoryFilterLength; j++) {
      if (categories[i].category == categoryProductFiltered[j])
      categoriesFiltered.push(categories[i]);
    }
  }

  return {
    props: {
      categoriesFiltered,
      products,
      ddecoCategory,
      categories
    },
    revalidate: 10,
  };
}



