/**El componente "Productos". Recibe tres accesorios, `productos`, `categorías` y `categorías filtradas`. Muestra todos los productos, filtrados por categoría si un parámetro de consulta de categoría está presente en la URL, y pagina los resultados.

El componente utiliza `useState` de React para la gestión del estado, la biblioteca `axios` para realizar solicitudes HTTP y varios otros componentes. Se utiliza `useRouter` para acceder a los parámetros de consulta desde la URL.

El componente devuelve un fragmento JSX que contiene un elemento principal, un componente NavBar, un componente ShowAllProducts con los productos y categorías actuales como accesorios, un componente Pagination con la página actual y el número total de productos como accesorios, y un componente de pie de página.
 */



import { useState } from "react";
import axios from "axios";
import Head from "next/head";
import { useRouter } from "next/router";
import NavBar from "../../../ddecocomponents/NavBar/NavBar";
import ShowAllProducts from "../../../ddecocomponents/ShowAllProducts/ShowAllProducts";
import Footer from "../../../ddecocomponents/Footer/Footer";
import Pagination from "../../../ddecocomponents/Pagination/Pagination";



function Products({ products, categories, categoriesFiltered, ddecoCategory }) {

  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(3);
/* Estas líneas de código están definiendo variables y funciones para paginación y filtrado de productos
en función de la categoría seleccionada por el usuario. La variable `filteredProducts` filtra los productos
en función de la categoría especificada en el parámetro de consulta de URL `categoria`. Los `indexLastShowProducts`
y las variables `indexFirstShowProducts` calculan el índice de los últimos y primeros productos a ser
mostrados en la página actual, en función de las variables `currentPage` y `productsPerPage`. 
La variable `currentProducts` filtra los productos según la categoría especificada en la consulta de la URL
en su parámetro `categoria`, y luego filtra el arreglo para incluir solo los productos que se mostrarán en el
página actual. La función `paginate` actualiza la variable de estado `currentPage` cuando el usuario hace clic
en un botón de paginación. */

  const filteredProducts = products.filter(
    (cat) => cat.category == router.query.categoria
  );
  const indexLastShowProducts = currentPage * productsPerPage;
  const indexFirstShowProducts = indexLastShowProducts - productsPerPage;
  const currentProducts = products
    .filter((cat) => cat.category == router.query.categoria )
    .slice(indexFirstShowProducts, indexLastShowProducts);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  return (
    <>
      <Head>
        <title> Productos | TLapps ddeco</title>
        <meta name="description" content="Inicio de sesion" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicontlapps.svg" />
      </Head>
      <NavBar
        categories={categories}
        categoriesFiltered={categoriesFiltered}
        products={products}
        ddecoCategory={ddecoCategory}
      />
      <main>
        <ShowAllProducts
          products={products}
          product={currentProducts}
          categories={categories}
          categoriesFiltered={categoriesFiltered}
        />
        <Pagination
          productsPerPage={productsPerPage}
          totalProducts={filteredProducts.length}
          paginate={paginate}
        />
        <Footer />
      </main>
    </>
  );
}

export default Products;

export async function getStaticPaths() {
  const { data } = await axios.get(
    "https://tlappshop.com/apis/api/sub-categories?filters[catalogo][$eq]=true&filters[category][category][$eq]=Tlapps ddeco&populate=*&pagination[limit]=800"
  );

  const categories = data.data.map((item) => `${item.attributes.subCategory}`);
  return {
    paths: categories.map((categoria) => ({
      params: { categoria },
    })),
    fallback: "blocking",
  };
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
