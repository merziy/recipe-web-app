<template>
  <section>
    <div class="green-bar" aria-hidden="true"></div>
    <img
      src="@/assets/chicken-and-rice.jpg" 
      width="120"
      height="115"
    >
    <article>
      <p>Lunch</p>
      <h3>Chicken and Rice With Scallion-Ginger Sauce</h3>
      <ul>
        <li>
          <p>Servings</p>
          <p>4</p>
        </li>
        <li>
          <p>Prep</p>
          <p>0:05</p>
        </li>
        <li>
          <p>Cook</p>
          <p>0:40</p>
        </li>
      </ul>
    </article>
  </section>
</template>

<style scoped>
  section {
    display: flex;
    flex-direction: row;
    gap: 1em;

    .green-bar {
      background-color: green;
      width: 10px;
      height: 115px;
    }

    img {
      max-width: 200px;
      object-fit: cover;
    }

    article {
      display: flex;
      flex-direction: column;
      > p {
        color: green;
        font-size: 15px;
      }
      h3 {
        font-size: 14px;
        text-wrap: wrap;
        width: 80%;
      }
      ul {
        list-style: none;
        display: flex;
        padding-left: 0;
        li:not(:nth-child(3)) {
          margin-right: 15px;
        }
      }
    }
  }
</style>
