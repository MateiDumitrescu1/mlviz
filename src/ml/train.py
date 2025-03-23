from js import postMessage
import time
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

if epochNr >=1:
    model_obj_global.train(x_train_global, y_train_global, epochs=1, lr=learning_rate_global)
if epochNr ==1:
    time.sleep(0.6) # pause a bit to see the initial weights and predictions

def encode_predictions_to_string(predictions):
    encoded_string = "p"
    for prediction in predictions:
        for value in prediction:
            encoded_string += str(value) + ","
        encoded_string += "#"
    return encoded_string


def convert_weights_to_string(weights):
    rez = "w"
    for layer_weights in weights: 
        # weight-urile pt fiecare layer sunt o matrice
        for neuron_weights in layer_weights:
            for weight in neuron_weights:
                rez = rez + str(weight) + ","
            rez += "|"
        rez = rez + "#"
    return rez

predictions_global = model_obj_global.forward(x_train_global)
prediction_list = predictions_global.tolist()
send_weights, send_biases = get_weights(model_obj_global)
string_to_send = convert_weights_to_string(send_weights)
prediction_string_to_send = encode_predictions_to_string(prediction_list)
postMessage(string_to_send)
postMessage(prediction_string_to_send)
# time.sleep(0.1)