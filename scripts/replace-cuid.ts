import fs from "fs";
import path from "path";
import chokidar from "chokidar";
import cuid from "cuid";

function replaceCuidInFile(file: string) {
  try {
    // Читаем содержимое файла
    let content = fs.readFileSync(file, "utf8");
    // Заменяем все вхождения {cuid} на уникальные идентификаторы
    const updatedContent = content.replace(/{cuid}/g, () => cuid());

    // Сравниваем старое и новое содержимое файла
    if (content !== updatedContent) {
      // Обновляем файл, если содержимое изменилось
      fs.writeFileSync(file, updatedContent, "utf8");
      console.log(`Обновлено: ${file}`);
    }
  } catch (error) {
    // Логируем ошибку, если не удалось обновить файл
    console.error(`Ошибка при обновлении файла ${file}:`, error);
  }
}

function watchYAMLFiles(relativePath: string) {
  // Определяем путь к директории с YAML файлами
  const directory = path.join(process.cwd(), relativePath);
  // Создаем наблюдатель за YAML файлами, включая вложенные директории
  const watcher = chokidar.watch(path.join(directory, "**/*.yaml"), {
    ignored: /^\./, // Игнорируем скрытые файлы
    persistent: true, // Наблюдатель будет работать постоянно
    ignoreInitial: false, // Не игнорируем файлы, которые уже были в директории при старте
  });

  // Обработчик события при добавлении нового файла
  watcher.on("add", (file) => {
    console.log(`Найден новый файл: ${file}`);
    replaceCuidInFile(file);
  });

  // Обработчик события при изменении существующего файла
  watcher.on("change", (file) => {
    console.log(`Обнаружены изменения в файле: ${file}`);
    replaceCuidInFile(file);
  });
}

// Использование аргумента командной строки для указания относительного пути
const relativePath: string = process.argv[2] || "./test-structure"; // По умолчанию используется './test-structure'
watchYAMLFiles(relativePath);
