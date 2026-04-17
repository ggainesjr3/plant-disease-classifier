import os
import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau

# --- 1. THE CORRECTED PATHS ---
PROJECT_ROOT = '/home/gary/plant-disease-classifier'
# Based on your logs, this is where the images actually live:
DATA_DIR = os.path.join(PROJECT_ROOT, 'data/raw/color')
MODEL_SAVE_PATH = os.path.join(PROJECT_ROOT, 'models/plant_model_v2.keras')

# --- 2. DATA GENERATOR WITH AUTO-SPLIT ---
IMG_SIZE = (224, 224)
BATCH_SIZE = 32

# validation_split=0.2 tells Keras to use 20% of the images for testing
datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=20,
    zoom_range=0.15,
    horizontal_flip=True,
    validation_split=0.2 
)

print(f"📂 Accessing dataset at: {DATA_DIR}")

train_generator = datagen.flow_from_directory(
    DATA_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='training' # Use the 80%
)

val_generator = datagen.flow_from_directory(
    DATA_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='validation' # Use the 20%
)

# --- 3. THE "BRAIN" (TRANSFER LEARNING) ---
base_model = tf.keras.applications.MobileNetV2(
    input_shape=(224, 224, 3), include_top=False, weights='imagenet'
)
base_model.trainable = False 

model = models.Sequential([
    base_model,
    layers.GlobalAveragePooling2D(),
    layers.Dropout(0.3),
    layers.Dense(train_generator.num_classes, activation='softmax')
])

model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

# --- 4. SMART CALLBACKS ---
callbacks = [
    EarlyStopping(monitor='val_loss', patience=4, restore_best_weights=True),
    ModelCheckpoint(MODEL_SAVE_PATH, save_best_only=True),
    ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=2)
]

# --- 5. TRAINING ---
print(f"🚀 Training on {train_generator.num_classes} plant classes...")
model.fit(
    train_generator,
    epochs=20,
    validation_data=val_generator,
    callbacks=callbacks
)

print(f"✅ Success! Brain saved to: {MODEL_SAVE_PATH}")