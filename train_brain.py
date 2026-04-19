import tensorflow as tf
from tensorflow.keras import layers, models, applications
import os

# 1. Local Path Setup
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# This points to the folder containing your plant categories
data_dir = os.path.join(BASE_DIR, 'data', 'plantvillage', 'PlantVillage') 

# Verification check
if not os.path.exists(data_dir):
    print(f"ERROR: Data folder not found at {data_dir}")
    print("Double-check that your folders are: data/plantvillage/PlantVillage")
    exit()

# 2. Data Loading
img_size = (224, 224)
batch_size = 32

print("Loading dataset...")
train_ds = tf.keras.utils.image_dataset_from_directory(
    data_dir,
    validation_split=0.2,
    subset="training",
    seed=123,
    image_size=img_size,
    batch_size=batch_size,
    label_mode='categorical'
)

val_ds = tf.keras.utils.image_dataset_from_directory(
    data_dir,
    validation_split=0.2,
    subset="validation",
    seed=123,
    image_size=img_size,
    batch_size=batch_size,
    label_mode='categorical'
)

# --- DYNAMIC FIX ---
# This automatically detects that you have 15 classes (folders)
num_classes = len(train_ds.class_names)
print(f"Detected {num_classes} classes. Adjusting model output layer...")

# 3. Model Setup (MobileNetV2 Transfer Learning)
base_model = applications.MobileNetV2(input_shape=(224, 224, 3),
                                     include_top=False,
                                     weights='imagenet')
base_model.trainable = False 

model = models.Sequential([
    layers.Input(shape=(224, 224, 3)),
    layers.Rescaling(1./255),
    base_model,
    layers.GlobalAveragePooling2D(),
    layers.Dense(128, activation='relu'),
    layers.Dropout(0.2), 
    layers.Dense(num_classes, activation='softmax') # Dynamically set to 15
])

model.compile(optimizer='adam', 
              loss='categorical_crossentropy', 
              metrics=['accuracy'])

# 4. Training
print("Starting training (this will run on your CPU)...")
# We'll stick with 10 epochs. Each one takes some time, so feel free to step away.
model.fit(train_ds, validation_data=val_ds, epochs=10)

# 5. Save the result
os.makedirs('models', exist_ok=True)
model.save('models/plant_disease_model.h5')
print("\nSuccess! Your trained model is saved at models/plant_disease_model.h5")