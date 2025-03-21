from js import postMessage
# import time
def get_weights(model):
    layers = model.layers
    weights = []
    biases = []
    for layer in layers:
        weights.append(layer.W)
        biases.append(layer.b)
    weights = [w.tolist() for w in weights]
    biases = [b.tolist() for b in biases]
    return weights,biases

# train 1 epoch
model_obj_global.train(x_train_global, y_train_global, epochs=1, lr=learning_rate_global)
predictions_global = model_obj_global.forward(x_train_global)

send_weights, send_biases = get_weights(model_obj_global)

def convert_weights_to_string(weights):
    rez = ""
    for layer_weights in weights: 
        # weight-urile pt fiecare layer sunt o matrice
        for neuron_weights in layer_weights:
            for weight in neuron_weights:
                rez = rez + str(weight) + ","
            rez += "|"
        rez = rez + "#"
    return rez

string_to_send = convert_weights_to_string(send_weights)

postMessage(string_to_send)
# time.sleep(0.1)