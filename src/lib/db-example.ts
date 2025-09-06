// Example usage of Prisma in your Next.js app
import { prisma } from "./prisma";

// Example function to create a user
export async function createUser(email: string, name?: string) {
  try {
    const user = await prisma.user.create({
      data: {
        email,
        name,
      },
    });
    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

// Example function to get all users
export async function getAllUsers() {
  try {
    const users = await prisma.user.findMany({
      include: {
        posts: true, // Include related posts
      },
    });
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

// Example function to create a post
export async function createPost(
  title: string,
  content: string,
  authorId: number
) {
  try {
    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId,
      },
      include: {
        author: true, // Include author information
      },
    });
    return post;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
}

// Clean up function (optional, for development)
export async function disconnect() {
  await prisma.$disconnect();
}
