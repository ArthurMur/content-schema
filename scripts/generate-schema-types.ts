import fs from "fs";
import path from "path";
import { compileFromFile } from "json-schema-to-typescript";
import chokidar from "chokidar";

// Асинхронная функция для конвертации JSON схемы в TypeScript типы
async function convertSchemaToType(file: string): Promise<void> {
  try {
    // Компилируем файл схемы
    const ts: string = await compileFromFile(file);
    // Записываем результат в .d.ts файл с тем же именем
    fs.writeFileSync(
      path.join(path.dirname(file), path.basename(file, ".json") + ".d.ts"),
      ts
    );
    console.log(`Конвертировано: ${file}`); // Логируем успешное выполнение
  } catch (error) {
    console.error(`Ошибка при конвертации файла ${file}:`, error); // Логируем ошибку, если что-то пошло не так
  }
}

// Функция для наблюдения за изменениями в JSON схемах и их автоматической конвертации
function watchSchemas(relativePath: string): void {
  // Определяем полный путь до директории относительно текущего рабочего каталога
  const directory: string = path.join(process.cwd(), relativePath);

  // Создаем наблюдатель за файлами с расширением .json
  const watcher = chokidar.watch(path.join(directory, "*.json"), {
    ignored: /^\./, // Игнорируем скрытые файлы
    persistent: true, // Наблюдатель будет работать постоянно
    ignoreInitial: false, // Не игнорируем файлы, которые уже были в директории при старте
  });

  // Обработчики событий наблюдения за файлами
  watcher
    .on("add", async (file) => {
      console.log(`Найден новый файл: ${file}`); // Логируем обнаружение нового файла
      await convertSchemaToType(file); // Конвертируем новый файл
    })
    .on("change", async (file) => {
      console.log(`Обнаружены изменения в файле: ${file}`); // Логируем изменения существующего файла
      await convertSchemaToType(file); // Повторно конвертируем измененный файл
    });
}

const relativePath: string = process.argv[2]; // По умолчанию используется './test-structure'
watchSchemas(relativePath);
