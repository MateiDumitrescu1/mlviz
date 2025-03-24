



#--------
import numpy as np
np.random.seed(0)


def sigmoid(z):
    return 1 / (1 + np.exp(-z))

def sigmoid_derivative(z):
    a = sigmoid(z)
    return a * (1 - a)

def relu(z):
    return np.maximum(0, z)

def relu_derivative(z):
    return np.where(z > 0, 1.0, 0.0)

def tanh(z):
    return np.tanh(z)

def tanh_derivative(z):
    return 1 - np.tanh(z)**2

def softmax(z):
    # subtract max for numerical stability
    shift_z = z - np.max(z, axis=0, keepdims=True)
    exps = np.exp(shift_z)
    return exps / np.sum(exps, axis=0, keepdims=True)

def softmax_derivative(z):
    # when used in combination with categorical cross-entropy, the gradient just simplifies. so we don't need to call this function, as the gradient simplifies
    # softmax is not usually paired with binary cross-entropy
    return None

def mse_loss(y, y_pred):
    m = y.shape[1]
    return np.sum(0.5 * (y - y_pred) ** 2) / m

def mse_loss_derivative(y, y_pred):
    return (y_pred - y)

def binary_cross_entropy_loss(y, y_pred):
    m = y.shape[1]
    eps = 1e-15  # avoid log(0)
    y_pred = np.clip(y_pred, eps, 1 - eps)
    return -np.sum(y * np.log(y_pred) + (1 - y) * np.log(1 - y_pred)) / m

def binary_cross_entropy_loss_derivative(y, y_pred):
    return (y_pred - y)

def categorical_cross_entropy_loss(y, y_pred):
    m = y.shape[1]
    eps = 1e-15
    y_pred = np.clip(y_pred, eps, 1 - eps)
    return -np.sum(y * np.log(y_pred)) / m

def categorical_cross_entropy_loss_derivative(y, y_pred):
    # for softmax outputs with categorical cross-entropy, the gradient simplifies to (y_pred - y)
    return (y_pred - y)

class Layer:
    def __init__(self, in_dim, out_dim, activation='sigmoid'):
        # initialize weights and biases.
        self.W = np.random.randn(out_dim, in_dim)
        self.b = np.zeros((out_dim, 1))
        # set activation function and its derivative
        if activation == 'sigmoid':
            self.activation = sigmoid
            self.activation_derivative = sigmoid_derivative
        elif activation == 'relu':
            self.activation = relu
            self.activation_derivative = relu_derivative
        elif activation == 'tanh':
            self.activation = tanh
            self.activation_derivative = tanh_derivative
        elif activation == 'softmax':
            self.activation = softmax
            self.activation_derivative = softmax_derivative
        else:
            raise ValueError("Unsupported activation function: " + activation)
    
    def forward(self, a_prev):
        # store the input (activation from previous layer)
        self.a_prev = a_prev
        # calculate weighted input z and activation a
        self.z = np.dot(self.W, a_prev) + self.b
        self.a = self.activation(self.z)
        return self.a

class NN:
    def __init__(self, layer_dims, activations=None, loss='mse'):
        # if no activations provided, default to sigmoid for all layers
        if activations is None:
            activations = ['sigmoid'] * (len(layer_dims) - 1)
        if len(activations) != len(layer_dims) - 1:
            raise ValueError("The number of activation functions must equal the number of layers minus one.")
        
        # create layers using provided dimensions and activation functions
        self.layers = []
        for i in range(len(layer_dims) - 1):
            self.layers.append(Layer(layer_dims[i], layer_dims[i+1], activation=activations[i]))
        
        # set loss function
        self.loss_name = loss
        if loss == 'binary_cross_entropy':
            self.loss = binary_cross_entropy_loss
            self.loss_derivative = binary_cross_entropy_loss_derivative
        elif loss == 'mse':
            self.loss = mse_loss
            self.loss_derivative = mse_loss_derivative
        elif loss == 'categorical_cross_entropy':
            self.loss = categorical_cross_entropy_loss
            self.loss_derivative = categorical_cross_entropy_loss_derivative
        else:
            raise ValueError("Unsupported loss function: " + loss)
    
    def forward(self, X):
        a = X
        for layer in self.layers:
            a = layer.forward(a)
        return a
    
    def backward(self, X, Y, output, lr):
        m = X.shape[1]  # nr of examples
        last_layer = self.layers[-1]
        
        # delta calculation for the last layer
        if (self.loss_name in ['binary_cross_entropy', 'categorical_cross_entropy'] and 
            (last_layer.activation == sigmoid or last_layer.activation == softmax)):
            delta = output - Y # in this case, the gradient simplifies to (output - Y)
        else:
            delta = self.loss_derivative(Y, output) * last_layer.activation_derivative(last_layer.z)
        
        dW = np.dot(delta, last_layer.a_prev.T) / m
        db = np.sum(delta, axis=1, keepdims=True) / m
        
        last_layer.W -= lr * dW
        last_layer.b -= lr * db
        
        # backpropagate through the hidden layers
        for l in range(len(self.layers) - 2, -1, -1):
            current_layer = self.layers[l]
            next_layer = self.layers[l+1]
            # http://ufldl.stanford.edu/tutorial/supervised/MultiLayerNeuralNetworks/
            delta = np.dot(next_layer.W.T, delta) * current_layer.activation_derivative(current_layer.z) # calculate delta for the current layer
            #~ delta is δ(l) = ((W(l+1))^T δ(l+1)) * f'(z(l))       
            # (this formula is taken the stanford link but we have some modifications to do: W(l+1) are the weights going into the neurons of layer l+1)
            # whereas in their link, they consider W(l) to be the weights coming out of layer l and going into the neurons of layer l+1
            dW = np.dot(delta, current_layer.a_prev.T) / m # weight gradient = δ(l+1) * a(l)^T
            db = np.sum(delta, axis=1, keepdims=True) / m # bias gradient = δ(l+1)
            # update the weights
            #TODO add a regularization parameter to this
            current_layer.W -= lr * dW
            current_layer.b -= lr * db
            
    def train(self, X, Y, epochs, lr):
        for _ in range(epochs):
            output = self.forward(X)
            # print("output", output)
            self.backward(X, Y, output, lr)
def create_model():    
    # define the model        
    model = NN(NNlayout, activations=NNactivations, loss=NNloss)
    return model

# conver to np array
x_train_global = np.array(x_train_global)
y_train_global = np.array(y_train_global)
x_test_global = np.array(x_test_global)
y_test_global = np.array(y_test_global)

if taskSelected == "iris": # we need to 
    np.random.seed(2321)
    x_train_global = x_train_global.T
    y_train_global = y_train_global.T
    x_test_global = x_test_global.T
    y_test_global = y_test_global.T

model_obj_global = create_model()
