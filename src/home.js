var data_excel = [];

const clicked = () => {
  document.getElementById("fileSelect").click();
};

const filePicked = (evt) => {
  let selectedFile = evt.target.files[0];
  console.log(selectedFile.name);
  document.getElementById(
    "file_name"
  ).innerHTML = `Documento: ${selectedFile.name}`;

  let reader = new FileReader();
  reader.onload = function (event) {
    let data = event.target.result;
    let workbook = XLSX.read(data, {
      type: "binary",
    });
    workbook.SheetNames.forEach(function (sheetName) {
      let XL_row_object = XLSX.utils.sheet_to_row_object_array(
        workbook.Sheets[sheetName]
      );
      LimpiarData(XL_row_object);
    });
  };

  reader.onerror = function (event) {
    console.error("File could not be read! Code " + event.target.error.code);
  };

  reader.readAsBinaryString(selectedFile);
};

// Ingreso del Excel
document.getElementById("fileSelect").addEventListener("change", function (ev) {
  filePicked(ev);
});

const LimpiarData = (data) => {
  const [val1, val2] = data;
  //Nombre del proyecto
  console.log(Object.keys(val2)[1]);
  agregarDatosProyecto(Object.keys(val1)[1], Object.values(val2)[1], "");
  const titulos_tabla = data[2];

  //Elimiar los 3 primeros registros de datos
  for (let i = 1; i <= 3; i++) data.shift();

  let newArray = [];
  crearListaSprint(data);


  data.forEach((tarea) => {
    const nameProject = Object.getOwnPropertyNames(tarea)[2]
    let peso_tarea = tarea[nameProject].split("(")[1];
    if (peso_tarea) peso_tarea = peso_tarea.split(")")[0];

    if (!peso_tarea) {
      peso_tarea = "No hay puntaje";
    }
    let obj = {
      tarea: tarea[nameProject],
      estado: tarea.__EMPTY_1,
      responsable: tarea.__EMPTY_3,
      terminado: tarea.__EMPTY_9,
      peso: peso_tarea,
      sprint: tarea.__EMPTY,
    };
    newArray.push(obj);
  });

  data_excel = newArray;
};

const agregarDatosProyecto = (nombreProyecto, fechaExportación, listSprint) => {
  document.getElementById("proyecto").innerHTML = `Proyecto: ${nombreProyecto}`;
  document.getElementById(
    "fecha_exportacion"
  ).innerHTML = `Fecha de exportación: ${fechaExportación}`;
};

const crearListaSprint = (data) => {
  let opcionSprint = [],
    opciones = "<option selected>Seleccionar Sprint</option>";
  data.forEach((tarea) => {
    opcionSprint.push(tarea.__EMPTY);
  });

  //Eliminar duplicados
  opcionSprint = new Set(opcionSprint);

  //Agregar opciones al Select
  opcionSprint.forEach((opc) => {
    opciones = opciones + `<option>${opc}</option>`;
  });
  document.getElementById("inputOpciones").innerHTML = opciones;
};

document.getElementById("inputOpciones").addEventListener("change", () => {
  crearTable();
  ActualizarGrafico();
});

document.getElementById("start").addEventListener("change", () => {
  ActualizarGrafico();
});
document.getElementById("end").addEventListener("change", () => {
  ActualizarGrafico();
});

const crearTable = () => {
  let filas = "",
    count = 1;

  const sprintSelect = document.getElementById("inputOpciones").value;

  console.log(sprintSelect);
  data_excel.forEach((tarea) => {
    if (sprintSelect == tarea.sprint) {
      filas =
        filas +
        `<tr>
            <th scope="row">${count}</th>
            <th>${tarea.tarea}</th>
            <th>${tarea.responsable}</th>
            <th>${tarea.peso}</th>
            <th>${tarea.estado}</th>
            <th>${tarea.terminado}</th>
        </tr>`;

      count++;
    }
  });

  //   body_tareas
  document.getElementById("body_tareas").innerHTML = filas;
};

//************************************************ Grafico ******************************************************
// Obtener una referencia al elemento canvas del DOM
const $grafica = document.querySelector("#grafica");
// Las etiquetas son las que van en el eje X.
let etiquetas = [];
let tareasPorRealizar = [];
let tareasRealizadas = [];
// Podemos tener varios conjuntos de datos
let datosTareasPorRealizar = {
  label: "Tareas realizadas",
  data: tareasRealizadas,
  backgroundColor: "rgba(220, 53, 69,0.2)",
  borderColor: "rgba(220, 53, 69,1)",
  borderDash: [10, 5],
  lineTension: 0,
  borderWidth: 1,
  fill: false,
};
let datosTareasRealizadas = {
  label: "Tareas por realizar",
  data: tareasPorRealizar,
  backgroundColor: "rgba(63, 81, 181,0.2)",
  borderColor: "rgba(63, 81, 181,1)",
  lineTension: 0,
  borderWidth: 1,
  fill: false,
};

const nuevoGrafico = () => {
  new Chart($grafica, {
    type: "line", // Tipo de gráfica
    data: {
      labels: etiquetas,
      datasets: [
        datosTareasPorRealizar,
        datosTareasRealizadas,
        // Aquí más datos...
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "Chart.js Line Chart",
        },
      },
    },
  });
};

const ActualizarGrafico = () => {
  ListaDias();
  arrayTareasPorRealizar();
  nuevoGrafico();
};

const ListaDias = () => {
  let list = ["Inicio"];

  const inicio = new Date(document.getElementById("start").value);
  const inicioNumero =
    inicio.getTime() + inicio.getTimezoneOffset() * 60 * 1000;
  console.log(inicio);

  const fin = new Date(document.getElementById("end").value);
  const finNumero = fin.getTime() + fin.getTimezoneOffset() * 60 * 1000;
  console.log(fin);

  for (let i = inicioNumero; i <= finNumero; i += 86400000) {
    let date = new Date(i);
    let day = date.getDate(i);
    let month = date.getMonth(i) + 1;
    let year = date.getFullYear(i);

    let dia = `${day}`;
    if (day < 10) dia = `0${day}`;
    if (month < 10) list.push(`${dia}/0${month}/${year}`);
    else list.push(`${dia}/${month}/${year}`);
  }

  console.log(list);
  etiquetas = list;
};

const arrayTareasPorRealizar = () => {
  let total = 0,
    arr = [];
  const opc = document.getElementById("inputOpciones").value;
  data_excel.forEach(function (tarea) {
    if (tarea.sprint === opc && parseInt(tarea.peso))
      total += parseInt(tarea.peso);
  });

  const cantidad = etiquetas.length,
    variante = total / (cantidad - 1);
  arr.push(total);
  console.log(variante);
  for (let i = 0; i < cantidad - 1; i++) {
    arr.push(total - variante * (i + 1));
  }
  datosTareasPorRealizar.data = arr;

  //Tareas realizadas
  let arr2 = [];
  arr2.push(total);

  for (let i = 1; i < cantidad; i++) {
    let count = 0;
    console.log(etiquetas[i]);
    data_excel.forEach(function (tarea) {
      if (
        tarea.sprint === opc &&
        parseInt(tarea.peso) &&
        tarea.terminado === etiquetas[i]
      )
        count += parseInt(tarea.peso);
    });
    arr2.push(count);
  }

  //Acumulado
  let acumulado = [],
    tareasCompletas = 0;
  acumulado.push(total);
  for (let i = 1; i < cantidad; i++) {
    let sum = 0;
    for (let j = 1; j <= i; j++) {
      sum += arr2[j];
    }
    tareasCompletas += arr2[i];
    acumulado.push(total - sum);
  }

  console.log(acumulado);
  datosTareasRealizadas.data = acumulado;
  console.log(tareasCompletas);
  console.log(arr[0]);
  const porcentaje = parseFloat((tareasCompletas / arr[0]) * 100).toFixed(1);
  document.getElementById(
    "cumplimiento"
  ).innerHTML = `Cumplimiento: ${porcentaje}%`;
};
