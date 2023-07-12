/**El componente "Productos". Recibe tres accesorios, `productos`, `categorías` y `categorías filtradas`. Muestra todos los productos, filtrados por categoría si un parámetro de consulta de categoría está presente en la URL, y pagina los resultados.

El componente utiliza `useState` de React para la gestión del estado, la biblioteca `axios` para realizar solicitudes HTTP y varios otros componentes. Se utiliza `useRouter` para acceder a los parámetros de consulta desde la URL.

El componente devuelve un fragmento JSX que contiene un elemento principal, un componente NavBar, un componente ShowAllProducts con los productos y categorías actuales como accesorios, un componente Pagination con la página actual y el número total de productos como accesorios, y un componente de pie de página.
 */



import { useState } from "react";
import axios from "axios";
import Head from "next/head";
import { useRouter } from "next/router";
import NavBar from "../../components/NavBar/NavBar";
import ShowAllProducts from "../../components/ShowAllProducts/ShowAllProducts";
import Footer from "../../components/Footer/Footer";
import Pagination from "../../components/Pagination/Pagination";



function Products({ products, categories, categoriesFiltered }) {

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
    .filter((cat) => cat.category[0] == router.query.categoria )
    .slice(indexFirstShowProducts, indexLastShowProducts);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <Head>
        <title>Productos | TLapps</title>
        <meta name="description" content="Inicio de sesion" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicontlapps.svg" />
      </Head>
      <NavBar
        categories={categories}
        categoriesFiltered={categoriesFiltered}
        products={products}
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
    "https://tlappshop.com/apis/api/categories?filters[Catalogo][$eq]=true&populate=cover,background,thumbnail"
  );

  const categories = data.data.map((item) => `${item.attributes.category}`);
  return {
    paths: categories.map((categoria) => ({
      params: { categoria },
    })),
    fallback: 'blocking',
  };
}

export async function getStaticProps() {
  const categoriesFiltered = [];
  const allProducts = await axios.get(
    "https://tlappshop.com/apis/api/products?populate=categories,thumbnail,ficha,instructivo,accesorios,galeria&filters[catalogo][$eq]=true&pagination[limit]=800"
  );
  const allCategories = await axios.get(
    "https://tlappshop.com/apis/api/categories?filters[Catalogo][$eq]=true&populate=cover,background,thumbnail"
  );

  const categories = allCategories.data.data.map((item) => ({
    id: item.id,
    category: item.attributes.category,
    img: item.attributes.background.data.map(item => item.attributes.formats.large.url),
    thumbImg: item.attributes.thumbnail.data.map(img => img.attributes.url).toString()
  }));

  const rawproducts = allProducts.data.data.map((item) => ({
    id: item.id,
    name: item.attributes.description?.replace(/['"]+/g, ""),
    codigo: item.attributes.sku,
    volt: item.attributes.voltaje,
    img:
      item.attributes.thumbnail.data.attributes.formats?.large?.url != undefined
        ? item.attributes.thumbnail.data.attributes.formats?.large?.url
        : "https://tlappshop-imagenes.s3.amazonaws.com/large_Categori_uea_ED_Automatizacio_uen_v2_copy_29dc855558.webp",
    category: item.attributes.categories.data.map(
      (cat) => cat.attributes.category),
  }));




/* Este código está eliminando el primer elemento de el arreglo `categoría` para cada producto en el arreglo `productos`,
 si coincide con los strings "Tira Led Baja Especi" o "Manguera Baja Especi". Esto se hace usando
un ciclo for para iterar sobre cada producto y una instrucción if para verificar si el primer elemento del
el arreglo `category` coincide con las cadenas especificadas. Si es así, se utiliza el método `shift()` para eliminar
el primer elemento de la arreglo. El operador de propagación se usa para crear una nueva arreglo 'productos' con
los productos modificados.*/
const products = [... rawproducts]

for (let i = 0; i < products.length; i++) {
  if(products[i].category[0] == "Tira Led Baja Especi" ){
    products[i].category.shift();
}
if(products[i].category[0] == "Manguera Baja Especi" ){
    products[i].category.shift();
}
  
}


    //Renderizado condicional de categorias en relacion a la existencia del producto

    const categoryProductFiltered = Array.from(
      new Set(
        allProducts.data.data
          .map((item) =>
            item.attributes?.categories?.data.map(
              (cat) => cat.attributes.category
            )
          )
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
    
    let categoryFilterLength = 0
    
    categoryFilterLength = categories.length > categoryProductFiltered.length ? categoryFilterLength = categories.length : categoryFilterLength = categoryProductFiltered.length
   
    
    for (let i = 0; i < categoryFilterLength; i++) {
      for (let j = 0; j < categoryFilterLength; j++) {
        if (categories[i]?.category == categoryProductFiltered[j])
          categoriesFiltered.push(categories[i]);
      }
    }

  return {
    props: {
      products,
      categories,
      categoriesFiltered,
    },
    revalidate: 10
  };
}
