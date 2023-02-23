const app = new Vue({
  el: "#app",
  data: {
    lessons: [],
    onHome: true,
    ascending: true,
    url: "https://webstoreapp-env.eba-yi2fch33.eu-west-2.elasticbeanstalk.com/collections",
    urls: "https://webstoreapp-env.eba-yi2fch33.eu-west-2.elasticbeanstalk.com",
    sortBy: "subject",
    cart: [],
    searchText: "",
    checkoutForm: {
      name: {
        value: "",
        error: "",
      },
      phone: {
        value: "",
        error: "",
      },
    },
  },
  // fetching the lessons in json from the get path
  created: function () {
    fetch(`${this.url}/lessons`)
      .then((response) => response.json())
      .then((lessons) => {
        this.lessons = lessons;
      });
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("service-worker.js");
    }
  },
  methods: {
    async getLessons() {
      try {
        const url = `${this.url}/lessons/search/${this.searchText}`;

        const response = await fetch(url);

        this.lessons = await response.json();
      } catch (error) {
        this.error = error;
      }
    },
    createNewOrder(order) {
      fetch(`${this.url}/orders`, {
        method: "POST", //set the HTTP method as "POST"
        headers: {
          "Content-Type": "application/json", //set the data type as JSON
        },
        body: JSON.stringify(order), //need to stringigy the JSON
      }).then(function (response) {
        response.json().then(function (json) {
          // alert("Success: " + json.acknowledged);
          console.log("Success: " + json.acknowledged);
          // webstore.lessons.push(order);
        });
      });
    },
    async updateLesson({ lesson_id, space }) {
      try {
        const urla = `${this.url}/lessons/${lesson_id}`;

        fetch(urla, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            space: space,
          }),
        });
      } catch (error) {
        this.error = error;
      }
    },

    updateLessonSpaces(type, id) {
      switch (type) {
        case "decrease":
          this.lessons = this.lessons.map((item) => {
            if (item.id === id && item.space > 0)
              return { ...item, space: item.space-- };

            return item;
          });
          break;

        case "increase":
          this.lessons = this.lessons.map((item) => {
            if (item.id === id && item.space > 0)
              return { ...item, space: item.space++ };

            return item;
          });
          break;

        default:
          break;
      }
    },

    //Change Pages
    changePage() {
      this.onHome = !this.onHome;
    },
    canAddToCart(item) {
      return item.space > 0;
    },
    // Item Cart count
    cartCount(item) {
      let count = 0;
      for (var i = 0; i < this.cart.length; i++) {
        if (this.cart[i] === item) {
          count++;
        }
      }
      return count;
    },
    submitForm() {
      alert("Your order has been Submitted");
    },

    checkout() {
      this.cart.forEach(async (item) => {
        this.createNewOrder({
          name: this.checkoutForm.name.value,
          phone: this.checkoutForm.phone.value,
          id: item.lessonId,
          space: item.space,
        });

        this.updateLesson({
          space: item.space,
          lesson_id: item.lesson._id,
        });
      });

      this.changePage();

      this.cart = [];
    },
    // adds a lesson to cart
    addToCart(lessonId) {
      // find selected lesson id
      var lesson = this.getLessonById(lessonId);
      if (lesson.space > 0) {
        // decrease lesson space
        --lesson.space;

        // get existing item from cart
        var itemInCart = this.getCartItemFromCartByLessonId(lessonId);
        if (itemInCart != null) {
          // update existing item in cart
          ++itemInCart.space;
        } else {
          // adding new item to cart
          itemInCart = {
            lessonId: lessonId,
            space: 1,
            lesson: lesson,
            // name: "Ayo",
            // phoneNumber: "099497329987",
          };

          // update lesson space with put
          this.cart.push(itemInCart);
          // this.updateLessonSpaces("decrease", lessonId.space);
        }
      }
    },
    // removes a lesson from cart
    removeFromCart(lessonId) {
      // find selected lesson in cart
      var itemInCart = this.getCartItemFromCartByLessonId(lessonId);

      if (itemInCart.space == 1) {
        // if just one item space is left, remove item completely from cart
        var index = this.cart.map((x) => x.lessonId).indexOf(lessonId);
        this.cart.splice(index, 1);

        // redirect user back to home if cart is empty
        if (this.cart.length <= 0) {
          this.changePage();
        }
      } else {
        // reduce number of spaces of item in cart
        --itemInCart.space;
      }

      // increase lesson space
      var lesson = this.getLessonById(lessonId);
      ++lesson.space;
      // this.updateLessonSpaces("increase", lessonId.space);
    },
    // get lesson by id
    getLessonById(lessonId) {
      var lesson = this.lessons.find((u) => u.id == lessonId);
      return lesson;
    },
    // get item in cart by id
    getCartItemFromCartByLessonId(lessonId) {
      var item = this.cart.find((u) => u.lessonId == lessonId);
      return item;
    },
  },
  computed: {
    cartItemCount: function () {
      if (this.cart.length > 0)
        return this.cart.reduce((total, item) => total + item.space, 0);
      return 0;
    },
  },
  watch: {
    searchText: {
      handler(val) {
        this.getLessons();
      },
    },
  },
});
