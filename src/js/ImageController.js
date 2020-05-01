export default class DNDController {
  constructor() {
    this.error = document.querySelector('.error');
    this.input = document.querySelector('.input');
    this.inputCover = document.querySelector('.input_cover');
    this.imgContainer = document.querySelector('.dowloaded_container');
    this.server = 'http://localhost:7070/';
  }

  async init() {
    const imageList = await this.loadFromServer();
    while (this.imgContainer.firstChild) {
      this.imgContainer.removeChild(this.imgContainer.firstChild);
    }
    const urlsForImg = JSON.parse(imageList);
    for (const item of urlsForImg) {
      this.drawPreview(item);
    }

    this.inputCover.addEventListener('click', () => {
      this.input.dispatchEvent(new MouseEvent('click'));
    });

    this.inputCover.addEventListener('dragover', (event) => {
      event.preventDefault();
      this.inputCover.classList.add('focus');
    });

    this.inputCover.addEventListener('dragleave', (event) => {
      event.preventDefault();
      this.inputCover.classList.remove('focus');
    });

    this.inputCover.addEventListener('drop', (event) => {
      event.preventDefault();
      const files = Array.from(event.dataTransfer.files);
      this.uploadToServer(files);
      this.inputCover.classList.remove('focus');
    });

    this.input.addEventListener('input', (event) => {
      const files = Array.from(event.currentTarget.files);
      this.uploadToServer(files);
    });

    this.imgContainer.addEventListener('click', (event) => {
      if (event.target.className === 'delete_btn') {
        event.target.parentNode.remove();
        this.deleteFromServer(event.target.parentNode.dataset.id);
      }
    });
  }

  drawPreview(imageURL) {
    const image = document.createElement('img');
    image.src = `${this.server}${imageURL}`;
    image.addEventListener('load', () => {
      image.className = 'image';
      image.alt = 'Загруженное изображение';
      const imageContainer = document.createElement('div');
      imageContainer.dataset.id = imageURL;
      imageContainer.classList.add('image_container');
      const deleteBtn = document.createElement('span');
      deleteBtn.classList.add('delete_btn');
      deleteBtn.textContent = '✖';
      imageContainer.appendChild(deleteBtn);
      imageContainer.appendChild(image);
      this.imgContainer.appendChild(imageContainer);
    });
    image.addEventListener('error', () => {
      this.error.classList.remove('none');
    });
  }

  async uploadToServer(images) {
    for (const image of images) {
      const formData = new FormData();
      formData.append('file', image);
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${this.server}`);

      xhr.addEventListener('load', async () => {
        if (xhr.status === 200) {
          const imageList = await this.loadFromServer();
          while (this.imgContainer.firstChild) {
            this.imgContainer.removeChild(this.imgContainer.firstChild);
          }
          const urlsForImg = JSON.parse(imageList);
          for (const item of urlsForImg) {
            this.drawPreview(item);
          }
        }
      });
      xhr.send(formData);
    }
  }

  async loadFromServer() {
    const request = new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', this.server);
      xhr.addEventListener('load', () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            resolve(xhr.response);
          }
        }
      });
      xhr.send();
    });
    const result = await request;
    return result;
  }

  async deleteFromServer(imageUrl) {
    const url = `${this.server}?${imageUrl}`;
    const request = new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open('DELETE', url);
      xhr.addEventListener('load', async () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            resolve(xhr.response);
            const imageList = await this.loadFromServer();
            while (this.imgContainer.firstChild) {
              this.imgContainer.removeChild(this.imgContainer.firstChild);
            }
            const urlsForImg = JSON.parse(imageList);
            for (const item of urlsForImg) {
              this.drawPreview(item);
            }
          }
        }
      });
      xhr.send();
    });
    const result = await request;
    return result;
  }
}
