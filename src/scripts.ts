import axios from 'axios';
import { formatDistanceToNow } from 'date-fns'; //importeju date function biboloteku

const addToShowCase = document.querySelector('.jsShowcase'); 

//visi elementi kas mums bus vajadzigi
type Cars = {
    title: string;
    year: string;
    description: string;
    price: string;
    id: number;
    date: number;
}


const drawCars = () => {
    const result = axios.get<Cars[]>("http://localhost:3004/cars");

    addToShowCase.innerHTML = ''; // si koda dala atbild lai nedublejas showcase

    result.then(({ data }) => {
        data.forEach((cars: Cars) => {
            const dateTimestamp = typeof cars.date === 'number' ? cars.date : 0; // parliecinas ka cars date ir numurs, ja nav tad cars date bus 0
            const timeAgo = formatDistanceToNow(new Date(dateTimestamp), { addSuffix: true, includeSeconds: false }); //parveido laiku lasamu(addSuffix pieleik klat ago utt. includeseconds sekundes)
            
            //uztaisa jaunu html failu
            addToShowCase.innerHTML += ` 
                <div class="showcase-content">
                    <div class="picture-wrapper">
                        <img src="assets/images/car.jpg" alt="" class="picture">
                    </div>
                    <div class="car-outputs">
                        <h2>${cars.title}</h2>
                        <p>Year: ${cars.year}</p>
                        <p>Description: ${cars.description}</p>
                        <p>Price: ${cars.price}$</p>
                    </div>
                    <div class="buttons-in">
                        <button class="button-cars jsEditButton" data-cars-id="${cars.id}">
                            Edit
                        </button>  
                        <button class="button-cars jsDeleteButton" data-cars-id="${cars.id}">
                            Delete
                        </button>  
                    </div>
                    <h6 class="date"> Created: ${timeAgo}  </h6>           
                </div>
            `;
        });

        //izdzes contentu ar Id palidzibu
        const carShowDelete = document.querySelectorAll<HTMLButtonElement>('.jsDeleteButton');

        carShowDelete.forEach((carsDelete) => {
            carsDelete.addEventListener("click", () => {
                const { carsId } = carsDelete.dataset;

                axios.delete(`http://localhost:3004/cars/${carsId}`).then(() => {
                    drawCars();
                });
            });
        });

        

        const carShowEdit = document.querySelectorAll<HTMLButtonElement>('.jsEditButton');

        carShowEdit.forEach((carsEdit) => {
            carsEdit.addEventListener('click', async () => {
                const carId = carsEdit.dataset.carsId;

                // Assuming you need to make an additional request to get car details
                const carDetails = await axios.get<Cars>(`http://localhost:3004/cars/${carId}`);
                const { title, description, price, year, date } = carDetails.data;

                const parentElement = carsEdit.closest('.showcase-content'); //mekle tuvako parent elementu

                const carOutputs = parentElement.querySelector('.car-outputs'); //un atrod visu kas ir ieks car-output
                if (carOutputs) {
                    carOutputs.innerHTML = ''; // Iznem ara existejosos elementus (year title ......) kas jau bija pirms nospiedam edit

                    const carTitleInput = document.createElement('input');
                    carTitleInput.type = 'text';
                    carTitleInput.value = title;

                    const carYearInput = document.createElement('input');
                    carYearInput.type = 'text';
                    carYearInput.value = year;

                    const carDescriptionInput = document.createElement('textarea');
                    carDescriptionInput.value = description;

                    const carPriceInput = document.createElement('input');
                    carPriceInput.type = 'text';
                    carPriceInput.value = price;

                    const saveButton = document.createElement('button');
                    saveButton.textContent = 'Save';
                    saveButton.className = 'button-cars';
                    saveButton.addEventListener('click', async () => {
                        const updatedData = {
                            title: carTitleInput.value,
                            year: carYearInput.value,
                            description: carDescriptionInput.value,
                            price: carPriceInput.value,
                            date: date 
                        };

                        try {   //Asinhrono darbību veikšanai laba prakse ir izmantot try...catch
                            await axios.put(`http://localhost:3004/cars/${carId}`, updatedData);
                            drawCars();
                        } catch (error) {
                            console.error('Error updating data:', error);
                        }
                    });

                    //si funckcija uzzime visu
                    function drawEditInput(container: HTMLElement, input:HTMLElement | HTMLTextAreaElement, labelText: string) {
                        container.appendChild(input);
                        container.appendChild(document.createTextNode(`: ${labelText}`));
                        container.appendChild(document.createElement('br'));
                        container.appendChild(document.createElement('br'));
                    }
                    
                    carOutputs.appendChild(document.createElement('br'));
                    drawEditInput(carOutputs as HTMLElement, carTitleInput, 'Title');
                    drawEditInput(carOutputs as HTMLElement, carYearInput, 'Year');
                    drawEditInput(carOutputs as HTMLElement, carDescriptionInput, 'Description');
                    drawEditInput(carOutputs as HTMLElement, carPriceInput, 'Price');

                    carOutputs.appendChild(saveButton);

                    /*  Lielais kods kuru aizvietojam
                    carOutputs.appendChild(carTitleInput);
                    carOutputs.appendChild(document.createTextNode(': Title'));
                    carOutputs.appendChild(document.createElement('br','br'));
                    carOutputs.appendChild(document.createElement('br'));
                    carOutputs.appendChild(carYearInput);
                    carOutputs.appendChild(document.createTextNode(': Year'));
                    carOutputs.appendChild(document.createElement('br'));
                    carOutputs.appendChild(document.createElement('br'));
                    carOutputs.appendChild(carDescriptionInput);
                    carOutputs.appendChild(document.createTextNode(': Description'));
                    carOutputs.appendChild(document.createElement('br'));
                    carOutputs.appendChild(document.createElement('br'));
                    carOutputs.appendChild(carPriceInput);
                    carOutputs.appendChild(document.createTextNode(': Price'));
                    carOutputs.appendChild(document.createElement('br'));
                    carOutputs.appendChild(document.createElement('br'));
                    
                    carOutputs.appendChild(saveButton);
                    **/
                }
            });
        });
    });
}

drawCars();

const carForm = document.querySelector(".jsAddCars");

carForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const carTitleInput = document.querySelector('input[name=car-title]') as HTMLInputElement;
    const carPriceInput = document.querySelector('input[name=car-price]') as HTMLInputElement;
    const carYearInput = document.querySelector('input[name=car-year]') as HTMLInputElement;
    const carDescriptionTextarea = document.querySelector('textarea[name=car-description]') as HTMLInputElement;
    const carShowDelete = document.querySelectorAll<HTMLButtonElement>('.jsDeleteButton');

    const currentDate = new Date();  //uztaisa jaunu date objectu ar pasreizejo laiku
    const timestamp = currentDate.getTime(); //January 1, 1970, 00:00:00 UTC skaita milisekundes ????

    const formData: Cars = {
        title: carTitleInput.value,
        year: carYearInput.value,
        description: carDescriptionTextarea.value,
        price: carPriceInput.value,
        id: Number(carShowDelete.values),
        date: timestamp
    };

    axios.post("http://localhost:3004/cars", formData).then(() => {
        drawCars();

        //lai visi value paliek par tuksiem stringiem kad uzpiezu add
        carTitleInput.value = '';
        carPriceInput.value = '';
        carYearInput.value = '';
        carDescriptionTextarea.value = '';
    });

});
