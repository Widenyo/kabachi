# Kabachi - VTuber IA

Kabachi es un proyecto de VTuber IA que utiliza NodeJS. Con este proyecto, podrás crear tu propio personaje virtual que pueda interactuar con tu audiencia en tiempo real.

## Requerimientos

Antes de comenzar, necesitarás tener instalado NodeJS en tu ordenador. Puedes descargar la versión más reciente de NodeJS desde [la página oficial](https://nodejs.org).

Tambien necesitarás una **API KEY** de openai además de una **TTS KEY** de azure

## Instalación

1. Clona este repositorio a tu ordenador:

   ```
   git clone https://github.com/tu-usuario/kabachi.git
   ```

2. Entra al directorio del proyecto:

   ```
   cd kabachi
   ```

3. Instala las dependencias del proyecto:

   ```
   npm install
   ```

4. Crea un archivo `.env` con las siguientes variables de entorno:

   ```
    TTS_KEY=<azure-tts-key>
    TTS_REGION=<azure-tts-region>
    OPENAI_KEY=<openai-key>
   ```

   Estas variables de entorno son necesarias para autenticar la conexión con la API de la plataforma que vayas a utilizar para transmitir tus videos.

5. Ejecuta el programa:

   ```
   npm start
   ```

## Uso

Para personalizar Kabachi, deberás crear tu propio personaje, el cual puedes editar en **config/char_config.json** y configurar la id del stream (por ahora solo existe soporte para YouTube) en **config/stream_config** además de la configuración del TTS en **config/tts_config.json**.

## Creadores

Kabachi ha sido creado por las siguientes personas:

- [Widenyo](https://github.com/Widenyo)
- [Loops6340](https://github.com/loops6340)

## Licencia

Este proyecto se distribuye bajo la licencia MIT. Para más información, consulta el archivo `LICENSE.md`.
