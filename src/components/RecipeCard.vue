<script setup lang="ts">
import { useRouter } from 'vue-router';

  const router = useRouter();
const props = defineProps({
  title: String,
  description: String,
  servings: Number,
  prepTime: String,
  cookTime: String,
  handle: String,
  image: String,
});

function goToArticle() {
  router.push(`/article/${props.handle}`);
}

const imageSrc = (() => {
  const img = props.image;
  if (!img) return '';
  if (typeof img === 'string') {
    if (img.startsWith('data:') || img.startsWith('http')) return img;
    if (img.startsWith('/')) return img;
    return '';
  }
  return '';
})();
</script>

<template>
  <section @click="goToArticle" style="cursor:pointer;">
    <div class="green-bar" aria-hidden="true"></div>
    <img
      v-if="imageSrc"
      :src="imageSrc"
      width="120"
      height="115"
    />
    <article>
      <p>{{ props.title }}</p>
      <h3>{{ props.description }}</h3>
      <ul>
        <li>
          <p>Servings</p>
          <p>{{ props.servings }}</p>
        </li>
        <li>
          <p>Prep</p>
          <p>{{ props.prepTime }}</p>
        </li>
        <li>
          <p>Cook</p>
          <p>{{ props.cookTime }}</p>
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
